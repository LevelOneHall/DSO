export const referCheck = (capitalFlag: boolean, enemyName: string, isNamed: boolean, isDescribed: boolean) => {
  if (isNamed) return "";
  if (capitalFlag) {
    return isDescribed ? "The" : "A";
  } else {
    return isDescribed ? "the" : "a";
  }
};

export const generateNamedEnemy = () => {
    const firstNames = ["Veskar", "Evenkar", "Astoroth", "Kaelen", "Gorak", "Sylvian", "Morbius", "Malacor"];
    const titles = ["the Cruel", "the Seer", "of Starke", "the Void-Walker", "the Defiler", "the Great", "the Bloodthirsty"];
    
    const isLegendary = Math.random() > 0.7;
    const name = firstNames[Math.floor(Math.random() * firstNames.length)];
    const title = titles[Math.floor(Math.random() * titles.length)];
    
    if (isLegendary) return { name: `${name} ${title}`, rarity: 'legendary' as const };
    return { name, rarity: 'rare' as const };
};

export const getEnemyName = (name: string, isNamed: boolean, isDescribed: boolean) => {
   if (isNamed) return name;
   return name; // Since if it's described like 'vile goblin' the modifier is part of the name
};
