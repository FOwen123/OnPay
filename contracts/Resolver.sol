// SPDX-License-Identifier: MIT

pragma solidity ^0.8.28;

contract Resolver{
    error Resolver__InvalidUsername();
    error Resolver__AlreadyRegistered();
    error Resolver__NameTaken();
    error Resolver__UsernameNotRegistered();
    error Resolver__EmptyCID();

    struct UserProfile {
        string username;
        string avatarCID;
    }

    mapping(address => UserProfile) public userProfiles;
    mapping(string => address) public nameToAddress;

    event UsernameRegistered(address indexed user, string username);
    event AvatarUpdated(address indexed user, string cid);

    function _isValidUsername(string memory name) internal pure returns (bool){
        bytes memory s = bytes(name);
        if (s.length == 0 || s.length > 32) {  // length check
            return false;
        }

        for (uint i = 0; i < s.length; i++)
        {
            bytes1 char = s[i];
            if (
                !(char >= 0x30 && char <= 0x39) && // 0 - 9
                !(char >= 0x61 && char <= 0x7A)    // a - z
            ) {
                return false;
            }
        }

        return true;
    }

    function register(string calldata name) external {
        require(_isValidUsername(name), Resolver__InvalidUsername());
        require(bytes(userProfiles[msg.sender].username).length == 0, Resolver__AlreadyRegistered());
        require(nameToAddress[name] == address(0), Resolver__NameTaken());

        userProfiles[msg.sender].username = name;
        nameToAddress[name] = msg.sender;
        emit UsernameRegistered(msg.sender, name);
    }

    function resolve(string calldata name) external view returns (address) {
        return nameToAddress[name];
    }

    modifier onlyRegistered() {
        require(bytes(userProfiles[msg.sender].username).length > 0, Resolver__UsernameNotRegistered());
        _; 
    }

    function setAvatar(string calldata avatarCID) external onlyRegistered{
        require(bytes(avatarCID).length > 0, Resolver__EmptyCID());
        userProfiles[msg.sender].avatarCID = avatarCID;
        emit AvatarUpdated(msg.sender, avatarCID);
    }

    function getUsername(address user) external view returns (string memory) {
        return userProfiles[user].username;
    }

    function getProfile(address user) external view returns (string memory, string memory){
        return (userProfiles[user].username, userProfiles[user].avatarCID);
    }
}