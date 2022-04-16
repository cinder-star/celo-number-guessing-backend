const { newKit } = require('@celo/contractkit');
const gameFactory = require('../../../abis/GameFactory.json');
const ierc20 = require('../../../abis/IERC20.json');
const keccak256 = require('keccak256');

require('dotenv').config();

async function createGame(req, res) {
  const kit = newKit('https://alfajores-forno.celo-testnet.org');
  kit.defaultAccount = process.env.CELO_ADDRESS;
  kit.connection.addAccount(process.env.WALLET_SECRET);
  const contract = new kit.web3.eth.Contract(
    gameFactory,
    process.env.GAME_FACTORY_ADDRESS
  );
  const EdenToken = new kit.web3.eth.Contract(
    ierc20,
    process.env.EDEN_TOKEN_ADDRESS
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
      .approve(game, req.body.funds)
      .send({ gas: 2100000, gasPrice: 200000000, from: kit.defaultAccount });
    await EdenToken.methods
      .transfer(game, req.body.funds)
      .send({ gas: 2100000, gasPrice: 200000000, from: kit.defaultAccount });

    res.send({
      gameId: game,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
}

module.exports = {
  createGame,
};
