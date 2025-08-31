function getChampionshipStartDate(dateString) {
  const startDate = new Date('2025-06-02T00:00:00Z');
  const givenDate = new Date(dateString);

  // Calculate the difference in milliseconds
  const diff = givenDate.getTime() - startDate.getTime();

  // Calculate the number of 14-day periods
  const fourteenDaysInMillis = 14 * 24 * 60 * 60 * 1000;
  const periods = Math.floor(diff / fourteenDaysInMillis);

  // Calculate the start date of the round
  const roundStartDate = new Date(
    startDate.getTime() + periods * fourteenDaysInMillis
  );

  // Format the date to YYYY-MM-DD
  const year = roundStartDate.getFullYear();
  const month = String(roundStartDate.getMonth() + 1).padStart(2, '0');
  const day = String(roundStartDate.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function mapRecordData(inputData, recordDetails, battleType) {
  let stage = inputData['stage'];
  if (stage && stage !== '无套装') {
    stage = stage.substring(0, stage.length - 5);
  }

  const baseData = {
    生命: inputData['hp'],
    攻击: inputData['attack'],
    防御: inputData['defence'],
    暴击: inputData['crit-rate'],
    暴伤: inputData['crit-dmg'],
    誓约增伤: inputData['oath-boost'],
    誓约回能: inputData['oath-regen'],
    加速回能: inputData['energy-regen'],
    虚弱增伤: inputData['weaken-boost'],
    对谱: inputData['matching'],
    对谱加成: inputData['matching-buff'],
    搭档: inputData['partner'],
    搭档身份: inputData['partner-identity'],
    日卡: inputData['sun-card'],
    阶数: stage,
    武器: inputData['weapon'],
    星级: inputData['star-level'],
    卡总等级: inputData['card-total-level'],
    备注: inputData['note'],
    时间: new Date().toISOString(),
  };

  if (battleType === 'orbit') {
    const { levelType, levelMode, levelNumber, levelPart } = recordDetails;
    const level = levelPart ? `${levelNumber}_${levelPart}` : levelNumber;
    return {
      ...baseData,
      关卡: levelType,
      模式: levelMode,
      关数: level,
    };
  } else if (battleType === 'championships') {
    const { levelType } = recordDetails;
    return {
      ...baseData,
      关卡: levelType,
      加成: inputData['championships-buff'],
    };
  } else if (battleType === 'analyze') {
    const { levelType } = recordDetails;
    return {
      ...baseData,
      加成: inputData['championships-buff'],
    };
  }

  return baseData;
}

function formatNumberWithCommas(number) {
  if (number === undefined || number === null) {
    return '0';
  }
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export { getChampionshipStartDate, mapRecordData, formatNumberWithCommas };
