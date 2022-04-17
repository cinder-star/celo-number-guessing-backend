const { newKit } = require('@celo/contractkit');
const basicGameFactory = require('../../../abis/BasicGameFactory.json');
const edenGameFactory = require('../../../abis/EdenGameFactory.json');
const basicGame = require('../../../abis/BasicGame.json');
const edenGame = require('../../../abis/EdenGame.json');
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
    res.status(500).send({ message: err.message });
  }
}

async function getBasicHints(req, res) {
  const kit = newKit('https://alfajores-forno.celo-testnet.org');
  kit.defaultAccount = process.env.WALLET_ADDRESS;
  kit.connection.addAccount(process.env.WALLET_SECRET);
  const basicFactory = new kit.web3.eth.Contract(
    basicGameFactory,
    process.env.BASIC_GAME_FACTORY_ADDRESS
  );
  try {
    const address = await basicFactory.methods.getLastGame().call();
    const contract = new kit.web3.eth.Contract(basicGame, address);
    const hints = await contract.methods.getHints().call();
    res.send({ hints });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: err.message });
  }
}

async function playBasicGame(req, res) {
  // Set player wallet
  const kit = newKit('https://alfajores-forno.celo-testnet.org');
  const playerAddress =
    req.body.player === 1
      ? process.env.PLAYER1_WALLET_ADDRESS
      : process.env.PLAYER2_WALLET_ADDRESS;
  const playerSecret =
    req.body.player === 1
      ? process.env.PLAYER1_WALLET_SECRET
      : process.env.PLAYER2_WALLET_SECRET;
  kit.defaultAccount = playerAddress;
  kit.connection.addAccount(playerSecret);

  // Initialize contract
  const hash = '0x' + keccak256(req.body.secretNumber).toString('hex');
  const gameFactory = new kit.web3.eth.Contract(
    basicGameFactory,
    process.env.BASIC_GAME_FACTORY_ADDRESS
  );
  const gameId = await gameFactory.methods.getLastGame().call();
  const contract = new kit.web3.eth.Contract(basicGame, gameId);
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
          .distribute(playerAddress, '5000000000000000000')
          .send({
            gas: 2100000,
            gasPrice: 200000000,
            from: adminKit.defaultAccount,
          });
        const adminGameContract = new adminKit.web3.eth.Contract(
          basicGame,
          gameId
        );
        await adminGameContract.methods.pay(playerAddress).send({
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
    res.status(500).send({ message: err.message });
  }
}

async function createEdenGame(req, res) {
  // Set player wallet
  const kit = newKit('https://alfajores-forno.celo-testnet.org');
  const playerAddress =
    req.body.player === 1
      ? process.env.PLAYER1_WALLET_ADDRESS
      : process.env.PLAYER2_WALLET_ADDRESS;
  const playerSecret =
    req.body.player === 1
      ? process.env.PLAYER1_WALLET_SECRET
      : process.env.PLAYER2_WALLET_SECRET;
  kit.defaultAccount = playerAddress;
  kit.connection.addAccount(playerSecret);

  // Initialize contract
  const gameFactory = new kit.web3.eth.Contract(
    edenGameFactory,
    process.env.EDEN_GAME_FACTORY_ADDRESS
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
    // Transfer Celo to the game factory
    await CGLD.methods
      .approve(process.env.EDEN_GAME_FACTORY_ADDRESS, '1000000000000000000')
      .send({ gas: 2100000, gasPrice: 200000000, from: kit.defaultAccount });
    await CGLD.methods
      .transfer(process.env.EDEN_GAME_FACTORY_ADDRESS, '1000000000000000000')
      .send({ gas: 2100000, gasPrice: 200000000, from: kit.defaultAccount });

    // Create game and stake amount
    const hash =
      '0x' +
      keccak256(keccak256(keccak256(req.body.secretNumber))).toString('hex');
    await EdenToken.methods
      .approve(process.env.EDEN_GAME_FACTORY_ADDRESS, '3000000000000000000')
      .send({
        gas: 2100000,
        gasPrice: 200000000,
        from: kit.defaultAccount,
      });
    await gameFactory.methods
      .createEdenGame(
        hash,
        req.body.hints,
        req.body.participationFee,
        req.body.nftName,
        req.body.nftSymbol,
        req.body.nftDescription,
        req.body.nftURI
      )
      .send({
        gas: 15000000,
        gasPrice: 200000000,
        from: kit.defaultAccount,
      });

    // Transfer Celo to the game
    const gameId = await gameFactory.methods.getLastGame().call();
    await CGLD.methods
      .approve(gameId, '1000000000000000000')
      .send({ gas: 2100000, gasPrice: 200000000, from: kit.defaultAccount });
    await CGLD.methods
      .transfer(gameId, '1000000000000000000')
      .send({ gas: 2100000, gasPrice: 200000000, from: kit.defaultAccount });

    // Send response
    res.send({ gameId });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: err.message });
  }
}

async function getEdenGameInfo(req, res) {
  // Set player wallet
  const kit = newKit('https://alfajores-forno.celo-testnet.org');
  const playerAddress = process.env.PLAYER1_WALLET_ADDRESS;
  const playerSecret = process.env.PLAYER1_WALLET_SECRET;
  kit.defaultAccount = playerAddress;
  kit.connection.addAccount(playerSecret);

  // Initialize contract
  const gameFactory = new kit.web3.eth.Contract(
    edenGameFactory,
    process.env.EDEN_GAME_FACTORY_ADDRESS
  );

  try {
    // Fetch latest game address
    const gameId = await gameFactory.methods.getLastGame().call();
    const contract = new kit.web3.eth.Contract(edenGame, gameId);
    const gameInfo = await contract.methods.getGameInfo().call();
    const prizeInfo = await contract.methods.getNFTInfo(1).call();
    res.send({
      gameInfo: {
        hints: gameInfo['0'],
        participationFee: gameInfo['1'],
      },
      prizeInfo: {
        nftName: prizeInfo['0'],
        nftSymbol: prizeInfo['1'],
        nftDescription: prizeInfo['2'],
        nftURI: prizeInfo['3'],
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: err.message });
  }
}

async function edenGameRegister(req, res) {
  // Set player wallet
  const kit = newKit('https://alfajores-forno.celo-testnet.org');
  const playerAddress =
    req.body.player === 1
      ? process.env.PLAYER1_WALLET_ADDRESS
      : process.env.PLAYER2_WALLET_ADDRESS;
  const playerSecret =
    req.body.player === 1
      ? process.env.PLAYER1_WALLET_SECRET
      : process.env.PLAYER2_WALLET_SECRET;
  kit.defaultAccount = playerAddress;
  kit.connection.addAccount(playerSecret);

  // Initialize contract
  const gameFactory = new kit.web3.eth.Contract(
    edenGameFactory,
    process.env.EDEN_GAME_FACTORY_ADDRESS
  );
  const EdenToken = new kit.web3.eth.Contract(
    ierc20,
    process.env.EDEN_TOKEN_ADDRESS
  );

  try {
    // Fetch latest game Info
    const gameId = await gameFactory.methods.getLastGame().call();
    const contract = new kit.web3.eth.Contract(edenGame, gameId);
    const gameInfo = await contract.methods.getGameInfo().call();
    const paymentFee = gameInfo['1'];

    // Check if player has enough funds
    const balance = await EdenToken.methods.balanceOf(playerAddress).call();
    if (parseInt(balance) < parseInt(paymentFee)) {
      throw new Error('Not enough funds');
    } else {
      // Participate in game
      await EdenToken.methods
        .approve(gameId, paymentFee)
        .send({ gas: 2100000, gasPrice: 200000000, from: kit.defaultAccount });
      await contract.methods
        .participate()
        .send({ gas: 2100000, gasPrice: 200000000, from: kit.defaultAccount });
      res.send({ message: 'Registration successful' });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: err.message });
  }
}

async function playEdenGame(req, res) {
  // Set player wallet
  const kit = newKit('https://alfajores-forno.celo-testnet.org');
  const playerAddress =
    req.body.player === 1
      ? process.env.PLAYER1_WALLET_ADDRESS
      : process.env.PLAYER2_WALLET_ADDRESS;
  const playerSecret =
    req.body.player === 1
      ? process.env.PLAYER1_WALLET_SECRET
      : process.env.PLAYER2_WALLET_SECRET;
  kit.defaultAccount = playerAddress;
  kit.connection.addAccount(playerSecret);

  // Initialize contract
  const hash = '0x' + keccak256(req.body.secretNumber).toString('hex');
  const gameFactory = new kit.web3.eth.Contract(
    edenGameFactory,
    process.env.EDEN_GAME_FACTORY_ADDRESS
  );
  const gameId = await gameFactory.methods.getLastGame().call();
  const contract = new kit.web3.eth.Contract(edenGame, gameId);
  try {
    const receipt = await contract.methods.play(hash).send({
      gas: 2100000,
      gasPrice: 200000000,
      from: kit.defaultAccount,
    });
    const gameResult = receipt.events.GameResult.returnValues._msg;
    if (gameResult === 'Success') {
      res.send({ message: "Congratulations! You've won!" });
    } else {
      res.status(500).send({ message: gameResult });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: err.message });
  }
}

module.exports = {
  createBasicGame,
  playBasicGame,
  getBasicHints,
  createEdenGame,
  getEdenGameInfo,
  edenGameRegister,
  playEdenGame,
};
