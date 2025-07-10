module.exports = (req, res) => {
  const userState = {
    success: true,
    state: {
      matchTokens: 50,
      energy: 100,
      mining: {
        speed: { level: 1, baseCost: 10, value: 0.5, cost: 10 },
        capacity: { level: 1, baseCost: 10, value: 2, cost: 10 },
        time: { level: 1, baseCost: 10, value: 4, cost: 10 },
        currentEnergy: 0,
        timeLeft: 240
      }
    }
  };
  res.status(200).json(userState);
};