// Class 5–8 friendly questions. Add more objects here to expand Dino Quest.
export const questions = [
  { topic:'Maths', level:1, q:'What is 7 × 8?', a:['54','56','63','48'], correct:1 },
  { topic:'Science', level:1, q:'Which gas do plants use to make food?', a:['Oxygen','Nitrogen','Carbon dioxide','Helium'], correct:2 },
  { topic:'History', level:1, q:'The pyramids of Giza were built in which ancient civilization?', a:['Roman','Egyptian','Indus Valley','Mayan'], correct:1 },
  { topic:'Geography', level:1, q:'What is the largest ocean on Earth?', a:['Atlantic','Indian','Arctic','Pacific'], correct:3 },
  { topic:'Maths', level:2, q:'What is 3/4 written as a decimal?', a:['0.25','0.5','0.75','0.8'], correct:2 },
  { topic:'Science', level:2, q:'Which part of a plant absorbs water from the soil?', a:['Flower','Leaf','Stem','Roots'], correct:3 },
  { topic:'History', level:2, q:'Who was known as the “Iron Man of India”?', a:['Sardar Patel','Mahatma Gandhi','Jawaharlal Nehru','Subhas Bose'], correct:0 },
  { topic:'Geography', level:2, q:'The Tropic of Cancer passes through which country?', a:['India','Japan','Australia','Russia'], correct:0 },
  { topic:'Maths', level:3, q:'Solve: 5² + 3²', a:['16','25','34','64'], correct:2 },
  { topic:'Science', level:3, q:'Which force keeps planets moving around the Sun?', a:['Magnetism','Gravity','Friction','Electricity'], correct:1 },
  { topic:'History', level:3, q:'The Indian Constitution came into effect in which year?', a:['1947','1949','1950','1952'], correct:2 },
  { topic:'Geography', level:3, q:'Which is the longest river in the world?', a:['Amazon','Nile','Ganga','Yangtze'], correct:1 },
  { topic:'Maths', level:4, q:'A triangle has angles 50° and 60°. What is its third angle?', a:['60°','70°','80°','90°'], correct:1 },
  { topic:'Science', level:4, q:'What is the chemical symbol for sodium?', a:['S','So','Na','N'], correct:2 },
  { topic:'History', level:4, q:'Which movement did Gandhi launch in 1942?', a:['Swadeshi','Quit India','Non-Cooperation','Khilafat'], correct:1 },
  { topic:'Geography', level:4, q:'Which layer of Earth is made mostly of liquid iron and nickel?', a:['Crust','Mantle','Outer core','Inner core'], correct:2 },
  { topic:'Maths', level:5, q:'What is the HCF of 18 and 24?', a:['3','6','9','12'], correct:1 },
  { topic:'Science', level:5, q:'A solution with pH 3 is:', a:['Neutral','Basic','Acidic','A salt'], correct:2 },
  { topic:'History', level:5, q:'Who founded the Maurya Empire?', a:['Ashoka','Chandragupta Maurya','Harsha','Akbar'], correct:1 },
  { topic:'Geography', level:5, q:'Which type of rainfall is common near the equator?', a:['Convectional','Relief','Cyclonic','Winter'], correct:0 }
];

export function questionFor(level, used) {
  const choices = questions.filter(x => x.level === Math.min(level, 5) && !used.has(x.q));
  const pool = choices.length ? choices : questions.filter(x => !used.has(x.q));
  return pool[Math.floor(Math.random() * pool.length)] || questions[0];
}
