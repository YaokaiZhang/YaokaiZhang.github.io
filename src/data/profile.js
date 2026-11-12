// The landing page (About) and the header read from this file.

export const profile = {
  name: 'Yaokai Zhang',
  role: 'ML and AI engineer',
  intro: 'ML and AI engineer. Models, data pipelines, agent systems.',
  location: 'Helsinki, Finland',
  links: {
    github: 'https://github.com/YaokaiZhang',
    linkedin: '',
  },

  // Set to '' to show an empty frame instead.
  photo: 'media/about/portrait.jpg',

  about: [
    'I’ve worked in research and industry, across ML/AI, data, and signal processing, because I love learning by doing.',
    'As building gets easier, I care most about the parts that don’t: defining the problem, deciding what to build, judging the result, and understanding the whole picture. That is, critical thinking and taste.',
  ],

  // Folded "Outside work" section under the about text. Set facts to null to hide it.
  facts: {
    lead: 'I like books, movies, photography, and sports.',
    list: [
      ['Writers', 'Milan Kundera, Italo Calvino, and Wu Nien-jen'],
      ['Directors', 'Wes Anderson, Hirokazu Kore-eda, and Jean-Luc Godard'],
      ['Sports', 'Swimming, badminton, and basketball. I’m exploring skiing.'],
    ],
  },
};
