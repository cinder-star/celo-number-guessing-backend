const { newKit } = require('@celo/contractkit');
const basicGameFactory = require('../../../abis/BasicGameFactory.json');
const basicGame = require('../../../abis/BasicGame.json');
const ierc20 = require('../../../abis/IERC20.json');
const reserve = require('../../../abis/Reserve.json');
const keccak256 = require('keccak256');

require('dotenv').config();

async function createBasicGame(req, res) {
  const kit = newKit('https://alfajores-forno.celo-testnet.org');
  kit.defaultAccount = process.env.WALLET_ADDRESS;
  kit.connection.addAccount(process.env.WALLET_SECRET);
  const contract = new kit.web3.eth.Contract(
    basicGameFactory,
    process.env.BASIC_GAME_FACTORY_ADDRESS
  );
  const EdenToken = new kit.web3.eth.Contract(
    ierc20,
    process.env.EDEN_TOKEN_ADDRESS
  );
  const CGLD = new kit.web3.eth.Contract(
    ierc20,
    process.env.CGLD_TOKEN_ADDRESS
  );

  try {
    // Create the game
    const hash =
      '0x' +
      keccak256(keccak256(keccak256(req.body.secretNumber))).toString('hex');
    await contract.methods
      .createbasicGame(req.body.hints, hash, req.body.maxAttempts)
      .send({ gas: 2100000, gasPrice: 200000000, from: kit.defaultAccount });

    // Get the game address
    const game = await contract.methods.getLastGame().call();

    // Transfer funds to the game
    await EdenToken.methods
      .approve(process.env.RESERVE_ADDRESS, req.body.funds)
      .send({ gas: 2100000, gasPrice: 200000000, from: kit.defaultAccount });
    await EdenToken.methods
      .transfer(process.env.RESERVE_ADDRESS, req.body.funds)
      .send({ gas: 2100000, gasPrice: 200000000, from: kit.defaultAccount });

    // Transfer Celo to the game
    await CGLD.methods
      .approve(game, '1000000000000000000')
      .send({ gas: 2100000, gasPrice: 200000000, from: kit.defaultAccount });
    await CGLD.methods
      .transfer(game, '1000000000000000000')
      .send({ gas: 2100000, gasPrice: 200000000, from: kit.defaultAccount });
    await CGLD.methods
      .approve(process.env.RESERVE_ADDRESS, '1000000000000000000')
      .send({ gas: 2100000, gasPrice: 200000000, from: kit.defaultAccount });
    await CGLD.methods
      .transfer(process.env.RESERVE_ADDRESS, '1000000000000000000')
      .send({ gas: 2100000, gasPrice: 200000000, from: kit.defaultAccount });

    res.send({
      gameId: game,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
}

async function playBasicGame(req, res) {
  // Set player wallet
  const kit = newKit('https://alfajores-forno.celo-testnet.org');
  kit.defaultAccount = process.env.PLAYER_WALLET_ADDRESS;
  kit.connection.addAccount(process.env.PLAYER_WALLET_SECRET);

  // Initialize contract
  const hash = '0x' + keccak256(req.body.secretNumber).toString('hex');
  const contract = new kit.web3.eth.Contract(basicGame, req.body.gameId);
  try {
    const receipt = await contract.methods.play(hash).send({
      gas: 2100000,
      gasPrice: 200000000,
      from: kit.defaultAccount,
    });
    const gameResult = receipt.events.GameResult.returnValues._msg;
    if (gameResult === 'Success') {
      // Create kit and transfer funds
      const adminKit = newKit('https://alfajores-forno.celo-testnet.org');
      adminKit.defaultAccount = process.env.WALLET_ADDRESS;
      adminKit.connection.addAccount(process.env.WALLET_SECRET);
      const reserveContract = new adminKit.web3.eth.Contract(
        reserve,
        process.env.RESERVE_ADDRESS
      );

      // Transfer funds to the reserve
      if (await contract.methods.isPayablePlayer(kit.defaultAccount).call()) {
        await reserveContract.methods
          .distribute(process.env.PLAYER_WALLET_ADDRESS, '5000000000000000000')
          .send({
            gas: 2100000,
            gasPrice: 200000000,
            from: adminKit.defaultAccount,
          });
        const adminGameContract = new adminKit.web3.eth.Contract(
          basicGame,
          req.body.gameId
        );
        await adminGameContract.methods
          .pay(process.env.PLAYER_WALLET_ADDRESS)
          .send({
            gas: 2100000,
            gasPrice: 200000000,
            from: adminKit.defaultAccount,
          });
      }

      res.send({ message: "Congratulations! You've won!" });
    } else {
      res.status(500).send({ message: gameResult });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
}

module.exports = {
  createBasicGame,
  playBasicGame,
};
