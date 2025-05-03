// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PreservationContract {
    struct File {
        string hash;
        address owner;
        string metadata;
        bool hasRights;
        uint256 price;
    }

    mapping(string => File) public files;

    event FileRegistered(string hash, address owner, string metadata, bool hasRights, uint256 price);

    function registerFile(
        string memory _hash,
        string memory _metadata,
        bool _hasRights,
        uint256 _price
    ) public {
        require(bytes(files[_hash].hash).length == 0, "File already registered");
        files[_hash] = File(_hash, msg.sender, _metadata, _hasRights, _price);
        emit FileRegistered(_hash, msg.sender, _metadata, _hasRights, _price);
    }

    function getFileOwner(string memory _hash) public view returns (address) {
        return files[_hash].owner;
    }

    function getFile(string memory _hash) public view returns (File memory) {
        return files[_hash];
    }
}