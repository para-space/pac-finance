// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IPool, DataTypes} from "./core-v3/contracts/interfaces/IPool.sol";
import {IPoolAddressesProvider} from "./core-v3/contracts/interfaces/IPoolAddressesProvider.sol";
import {IWETH} from "./core-v3/contracts/misc/interfaces/IWETH.sol";
import {IFlashLoanSimpleReceiver} from "./core-v3/contracts/flashloan/interfaces/IFlashLoanSimpleReceiver.sol";

/// @title PAC Leverage Deposit Contract
/// @author PAC
contract LeverageDepositor is Ownable, IFlashLoanSimpleReceiver {
    using SafeERC20 for IERC20;

    /// @notice Lending Pool address
    IPool public immutable lendingPool;

    /// @notice Wrapped ETH contract address
    IWETH public immutable weth;

    uint16 private constant referralCode = 0;

    error AddressZero();

    error ReceiveNotAllowed();

    error InvalidFlashLoan();

    error ZeroAmount();

    error InvalidMsgValue();

    /**
     * @dev Emitted during leverageDeposit()
     * @param user The address of the user
     * @param asset The address of the asset
     * @param cashAmount The amount of cash for the deposit
     * @param borrowAmount The amount borrowed from lending pool for the deposit
     **/
    event LeverageDeposit(
        address user,
        address asset,
        uint256 cashAmount,
        uint256 borrowAmount
    );

    /**
     * @dev Emitted during rescueERC20()
     * @param token The address of the token
     * @param to The address of the recipient
     * @param amount The amount being rescued
     **/
    event RescueERC20(
        address indexed token,
        address indexed to,
        uint256 amount
    );

    constructor(address _lendingPool, address _weth) {
        if (address(_lendingPool) == address(0)) revert AddressZero();
        if (address(_weth) == address(0)) revert AddressZero();

        lendingPool = IPool(_lendingPool);
        weth = IWETH(_weth);
    }

    /**
     * @dev Only WETH contract is allowed to transfer ETH here. Prevent other addresses to send Ether to this contract.
     */
    receive() external payable {
        if (msg.sender != address(weth)) revert ReceiveNotAllowed();
    }

    /**
     * @dev Loop the deposit and borrow of an asset
     * @param asset to deposit
     * @param cashAmount cash amount for the deposit
     * @param borrowAmount borrow amount for the deposit
     **/
    function leverageDeposit(
        address asset,
        uint256 cashAmount,
        uint256 borrowAmount
    ) external payable {
        if (borrowAmount == 0) revert ZeroAmount();

        if (asset == address(0)) {
            if (cashAmount != msg.value) revert InvalidMsgValue();
            weth.deposit{value: cashAmount}();
            asset = address(weth);
        } else {
            if (msg.value != 0) revert InvalidMsgValue();
            if (cashAmount > 0) {
                IERC20(asset).safeTransferFrom(
                    msg.sender,
                    address(this),
                    cashAmount
                );
            }
        }

        bytes memory params = abi.encode(msg.sender, cashAmount, borrowAmount);
        lendingPool.flashLoanSimple(
            address(this),
            asset,
            borrowAmount,
            params,
            referralCode
        );

        emit LeverageDeposit(msg.sender, asset, cashAmount, borrowAmount);
    }

    /// @inheritdoc IFlashLoanSimpleReceiver
    function executeOperation(
        address asset,
        uint256 amount,
        uint256 premium,
        address initiator,
        bytes calldata params
    ) external returns (bool) {
        //decode param
        (address user, uint256 cashAmount, uint256 borrowAmount) = abi.decode(
            params,
            (address, uint256, uint256)
        );

        if (
            msg.sender != address(lendingPool) ||
            initiator != address(this) ||
            borrowAmount != amount
        ) revert InvalidFlashLoan();

        _checkApprove(asset);

        //supply asset
        uint256 supplyAmount = cashAmount + borrowAmount - premium;
        lendingPool.supply(asset, supplyAmount, user, referralCode);

        //borrow asset
        lendingPool.borrow(asset, borrowAmount, 2, referralCode, user);

        //nothing need to do for repaying flash loan since we've approved asset.

        return true;
    }

    /// @inheritdoc IFlashLoanSimpleReceiver
    function ADDRESSES_PROVIDER()
        external
        view
        returns (IPoolAddressesProvider)
    {
        return lendingPool.ADDRESSES_PROVIDER();
    }

    /// @inheritdoc IFlashLoanSimpleReceiver
    function POOL() external view returns (IPool) {
        return lendingPool;
    }

    /**
     * @notice Rescue erc20 from this contract address. Only owner can call this function
     * @param token The token address to be rescued
     * @param to The account address to receive token
     * @param amount The amount to be rescued
     **/
    function rescueERC20(
        address token,
        address to,
        uint256 amount
    ) external onlyOwner {
        IERC20(token).safeTransfer(to, amount);
        emit RescueERC20(token, to, amount);
    }

    /**
     * @notice Approves token allowance for lending pool.
     * @param asset Address of the asset
     **/
    function _checkApprove(address asset) internal {
        if (IERC20(asset).allowance(address(this), address(lendingPool)) == 0) {
            IERC20(asset).safeApprove(address(lendingPool), type(uint256).max);
        }
    }
}
