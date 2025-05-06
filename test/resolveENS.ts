import { namehash } from 'viem/ens'
import { createPublicClient, http } from 'viem'
import { sepolia } from 'viem/chains'

// Use public resolver address from Sepolia or your custom one
const resolverAddress = '0x8A968aB9eb8C084FBC44c531058Fc9ef945c3D61'

const client = createPublicClient({
  chain: sepolia,
  transport: http()
})

async function main() {
  const domain = 'haowen.lisk.eth'
  const node = namehash(domain)

  try {
    const owner = await client.readContract({
      address: resolverAddress,
      abi: [
        {
          name: 'addr',
          type: 'function',
          stateMutability: 'view',
          inputs: [{ name: 'node', type: 'bytes32' }],
          outputs: [{ name: '', type: 'address' }]
        }
      ],
      functionName: 'addr',
      args: [node],
    })

    if (owner === '0x0000000000000000000000000000000000000000') {
      console.log(`${domain} is not owned.`)
    } else {
      console.log(`${domain} is owned by: ${owner}`)
    }
  } catch (err) {
    console.error(`Failed to resolve ${domain}:`, err)
  }
}

main()
