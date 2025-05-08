import {
  createPublicClient,
  http,
  parseAbiParameters,
  decodeAbiParameters,
  encodeAbiParameters,
  getContract,
  ContractFunctionExecutionError,
  Hex
} from 'viem'
import { sepolia } from 'viem/chains'
import { namehash } from 'viem/ens'
import axios from 'axios'

// Configuration
const GATEWAY_URL = 'https://ens-gateway.onpaylisk.workers.dev'
const L1_RESOLVER_ADDRESS = '0x28d1a3eB328cb855887106A01d227357E26fF859'
const ENS_NAME = 'haowen.lisk.eth'

// ABI snippets
const resolverAbi = [
  {
    name: 'addr',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'node', type: 'bytes32' }],
    outputs: [{ name: 'addr', type: 'address' }]
  },
  {
    name: 'resolveWithProof',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'response', type: 'bytes' },
      { name: 'extraData', type: 'bytes' }
    ],
    outputs: [{ name: 'result', type: 'bytes' }]
  }
]

// Interface for CCIP-Read error
interface OffchainLookupData {
  sender: string
  urls: string[]
  callData: string
  callbackFunction: string
  extraData: `0x${string}`
}

// Create a viem client with CCIP-Read support
const client = createPublicClient({
  chain: sepolia,
  transport: http(),
  batch: {
    multicall: true
  },
  // This is critical for handling CCIP-Read
  cacheTime: 0
})

async function testManualCcipReadFlow() {
  try {
    console.log(`\nTesting manual CCIP-Read flow for ${ENS_NAME}...\n`);

    // 1. Get the namehash
    const node = namehash(ENS_NAME)
    console.log(`Name hash: ${node}`)

    // Create a contract instance for the resolver
    const resolver = getContract({
      address: L1_RESOLVER_ADDRESS,
      abi: resolverAbi,
      client
    })

    try {
      // 2. First, try to call addr directly (this should revert with OffchainLookup)
      console.log(`\nCalling addr(${node}) on L1 resolver...`)
      const directResult = await resolver.read.addr([node])
      console.log(`Direct result (should not happen): ${directResult}`)
    } catch (error: any) {
      // 3. If we get an OffchainLookup error, let's extract the data
      if (error && error.name === 'ContractFunctionExecutionError' && error.cause?.name === 'OffchainLookupError') {
        // Successfully caught an OffchainLookup error
        console.log('\nCaught OffchainLookup error (expected)')

        // Extract the offchain lookup data from the error
        const cause = error.cause || {}
        const sender = (cause.sender || '') as string
        const urls = (cause.urls || []) as string[]
        const callData = (cause.callData || '') as string
        const callbackFunction = (cause.callbackFunction || '') as string
        let extraData = (cause.extraData || '0x') as string

        // Ensure extraData is a proper hex string
        if (!extraData.startsWith('0x')) {
          extraData = `0x${extraData}`
        }

        console.log(`OffchainLookup sender: ${sender}`)
        console.log(`OffchainLookup URLs: ${urls[0]}`)

        // 4. Make a request to the gateway URL
        console.log(`\nMaking HTTP request to gateway: ${GATEWAY_URL}/v1/${sender}/${callData}`)
        const response = await axios.get(`${GATEWAY_URL}/v1/${sender}/${callData}`)

        if (response.data && response.data.data) {
          console.log('Gateway response received')

          // 5. Call the callback function with the response
          console.log('\nCalling resolveWithProof with the gateway response...')

          // Ensure the response data is a proper hex string
          let responseData = response.data.data as string
          if (!responseData.startsWith('0x')) {
            responseData = `0x${responseData}`
          }

          // Call the callback function with the gateway response
          const result = await resolver.read.resolveWithProof([
            responseData as Hex,
            extraData as Hex
          ])

          // 6. Decode the result
          console.log('\nDecoding the result...')
          // Addr function returns a bytes result that needs to be interpreted as an address
          const addrResult = decodeAbiParameters(
            parseAbiParameters('address'),
            result as Hex
          )[0]

          console.log(`\n===== SUCCESS =====`)
          console.log(`Resolved ${ENS_NAME} to address: ${addrResult}`)
          console.log(`=====================`)
        } else {
          console.error('Invalid response from gateway:', response.data)
        }
      } else {
        console.error('Error calling addr (not an OffchainLookup):', error)
      }
    }
  } catch (err) {
    console.error('Error in testManualCcipReadFlow:', err)

    if (axios.isAxiosError(err) && err.response) {
      console.error('Response status:', err.response.status)
      console.error('Response data:', err.response.data)
    }
  }
}

testManualCcipReadFlow()
