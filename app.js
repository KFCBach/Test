const STORAGE_KEY = "fm26-squad-analysis-state-v1";
const DEFAULT_CSV = "./bologna_attributes_from_screenshots.csv";
const DEFAULT_LENSES = "./squad_analysis_lenses.json";
const FALLBACK_LENS_CONFIG = JSON.parse(`{
  "version": "1.0",
  "productName": "FM26 Squad Analysis",
  "productPurpose": "A squad analysis tool that translates Football Manager attributes into football-facing style lenses without recommending formations.",
  "principles": {
    "footballFirst": true,
    "formationRecommendations": false,
    "showAllPlayersPerLens": true,
    "excludeGoalkeepersFromOutfieldLenses": true,
    "usePositionAsSoftContextOnly": true
  },
  "scoreModel": {
    "coreWeight": 0.6,
    "supportWeight": 0.25,
    "accentWeight": 0.15,
    "gateCaps": [
      { "ifGateAverageBelow": 11.0, "scoreMax": 11.5 },
      { "ifGateAverageBelow": 12.0, "scoreMax": 13.0 },
      { "ifGateAverageBelow": 13.0, "scoreMax": 14.5 }
    ],
    "bands": {
      "strongFit": 14.5,
      "goodFit": 13.0,
      "workingOption": 11.5
    }
  },
  "toplineMetrics": [
    "Team Average",
    "Best Fit",
    "Weakest Fit",
    "Strong Fit Count",
    "Limiting Attribute",
    "Carry Attribute"
  ],
  "lenses": [
    {
      "id": "pressing_capacity",
      "label": "High Pressing Capacity",
      "shortMeaning": "How ready the squad is to press, counter-press and sustain repeated regain actions.",
      "description": "High scores suggest the squad can press high, force rushed decisions and repeat pressure actions without losing compactness. Lower scores suggest the press may look active, but arrive late, open gaps or fade over time.",
      "coachQuestions": ["Can the team lock opponents high?", "Can the press be repeated without losing structure?"],
      "core": { "Work Rate": 1.15, "Teamwork": 1.1, "Aggression": 1.0, "Stamina": 1.1, "Decisions": 1.0, "Anticipation": 1.0 },
      "support": { "Acceleration": 0.8, "Pace": 0.75, "Concentration": 0.7, "Tackling": 0.6, "Determination": 0.55 },
      "accent": { "Natural Fitness": 0.45, "Balance": 0.35, "Strength": 0.35, "Bravery": 0.3 },
      "gateAttributes": ["Work Rate", "Teamwork", "Decisions", "Anticipation"]
    },
    {
      "id": "line_height_control",
      "label": "High Line Control",
      "shortMeaning": "How safely the team can defend with space behind the back line.",
      "description": "High scores suggest the defensive line can hold a high position, compress the pitch, time the line together and recover when opponents attack the space behind. Lower scores suggest the team may be exposed by runs in behind, direct balls or poor offside-line timing.",
      "coachQuestions": ["Can the team hold a high defensive line?", "Can the back line time the offside line and recover?"],
      "core": { "Acceleration": 1.05, "Pace": 1.05, "Anticipation": 1.0, "Positioning": 1.0, "Decisions": 0.95, "Concentration": 0.95, "Teamwork": 0.9 },
      "support": { "Agility": 0.65, "Stamina": 0.55, "Balance": 0.5 },
      "accent": { "Marking": 0.35, "Composure": 0.35, "Bravery": 0.3 },
      "gateAttributes": ["Acceleration", "Pace", "Anticipation", "Positioning", "Concentration", "Teamwork"]
    },
    {
      "id": "box_defence",
      "label": "Low block: defend the box",
      "shortMeaning": "Can the player defend deep around the penalty area when the team absorbs pressure?",
      "description": "High scores point to players who can hold position, track danger early, defend crosses and survive long spells around their own box. Lower scores suggest the player may struggle when the team has to defend deep, deal with runners and manage repeated penalty-area pressure.",
      "coachQuestions": ["How safe is the team when defending the area?", "Can the squad absorb pressure around its own goal?"],
      "core": { "Positioning": 1.0, "Marking": 1.0, "Concentration": 0.95, "Anticipation": 0.95, "Heading": 0.9, "Jumping Reach": 0.9, "Bravery": 0.8 },
      "support": { "Tackling": 0.75, "Strength": 0.75, "Decisions": 0.65, "Teamwork": 0.55 },
      "accent": { "Balance": 0.35, "Aggression": 0.3, "Stamina": 0.25, "Determination": 0.2 },
      "gateAttributes": ["Positioning", "Marking", "Concentration", "Anticipation"]
    },
    {
      "id": "ball_retention",
      "label": "Possession Control",
      "shortMeaning": "Can the squad keep the ball under pressure, circulate with purpose, control rhythm and avoid cheap turnovers?",
      "description": "High scores suggest the squad can keep the ball under pressure, circulate with purpose and control the rhythm of the game. Lower scores suggest rushed touches, poor support angles and preventable turnovers.",
      "coachQuestions": ["Can the team keep the ball under pressure?", "Can the squad control rhythm and avoid cheap turnovers?"],
      "core": { "First Touch": 1.05, "Passing": 1.0, "Technique": 1.0, "Composure": 0.95, "Decisions": 0.9, "Teamwork": 0.9, "Vision": 0.85 },
      "support": { "Balance": 0.5, "Concentration": 0.45, "Anticipation": 0.4 },
      "accent": { "Agility": 0.35, "Dribbling": 0.3 },
      "gateAttributes": ["First Touch", "Passing", "Composure", "Teamwork", "Vision"]
    },
    {
      "id": "vertical_progression",
      "label": "Direct Progression",
      "shortMeaning": "Can the squad turn regains or early openings into forward attacks quickly, before the opponent reorganises?",
      "description": "High scores point to players who can turn regains or early openings into forward attacks quickly. Lower scores suggest the team may recycle safely, slow the attack down or fail to attack space before the opponent reorganises.",
      "coachQuestions": ["Can the team attack forward quickly?", "Can the squad turn regains into threat?"],
      "core": { "Decisions": 1.0, "Vision": 1.0, "Passing": 0.95, "First Touch": 0.9, "Technique": 0.85, "Off The Ball": 0.85 },
      "support": { "Acceleration": 0.6, "Pace": 0.55, "Dribbling": 0.5, "Teamwork": 0.45 },
      "accent": { "Flair": 0.35, "Balance": 0.3, "Anticipation": 0.3, "Composure": 0.3 },
      "gateAttributes": ["Decisions", "Vision", "Passing", "First Touch", "Off The Ball"]
    },
    {
      "id": "one_v_one_threat",
      "label": "1v1 Threat",
      "shortMeaning": "Can the player create imbalance by beating a defender, carrying the ball into dangerous areas and forcing the opponent to adjust, double up or lose structure?",
      "description": "High scores point to players who can beat defenders, carry the ball into dangerous areas and force the opponent to adjust or double up. Lower scores suggest the squad may rely more on combinations than individual elimination.",
      "coachQuestions": ["Who can beat a defender and create separation?", "Does the squad have enough individual destabilising power?"],
      "core": { "Dribbling": 1.1, "Acceleration": 1.0, "Agility": 0.95, "Balance": 0.9, "Technique": 0.9 },
      "support": { "Decisions": 0.7, "Flair": 0.65, "First Touch": 0.55, "Pace": 0.5, "Off The Ball": 0.45 },
      "accent": { "Composure": 0.3, "Anticipation": 0.25, "Strength": 0.25 },
      "gateAttributes": ["Dribbling", "Acceleration", "Technique"]
    },
    {
      "id": "running_threat",
      "label": "Final Third Creation",
      "shortMeaning": "Can the player create chances in the final third through vision, passing quality, combinations, crosses or individual creativity?",
      "description": "High scores point to players who can create chances in the final third through vision, passing quality, combinations, crosses or individual creativity. Lower scores suggest the squad may reach advanced areas but lack the final action to open opponents.",
      "coachQuestions": ["Who can create chances in the final third?", "Does the squad have enough final-ball quality?"],
      "core": { "Vision": 1.0, "Passing": 1.0, "Technique": 0.95, "Decisions": 0.95, "Flair": 0.9, "First Touch": 0.85 },
      "support": { "Crossing": 0.7, "Dribbling": 0.55, "Off The Ball": 0.5, "Composure": 0.45, "Teamwork": 0.45 },
      "accent": { "Anticipation": 0.3, "Long Shots": 0.3, "Corners": 0.25, "Free Kick Taking": 0.25 },
      "gateAttributes": ["Vision", "Passing", "Technique", "Decisions", "First Touch"]
    },
    {
      "id": "penalty_area_presence",
      "label": "Penalty-Area Goal Threat",
      "shortMeaning": "Can the player arrive in dangerous areas, read chances early and turn box entries into shots and goals?",
      "description": "High scores point to players who can arrive in the right areas, read chances early and turn box entries into shots and goals. Lower scores suggest the team may reach dangerous zones without enough finishing threat.",
      "coachQuestions": ["Who turns box entries into goals?", "Does the squad have enough penalty-area goal threat?"],
      "core": { "Finishing": 1.1, "Off The Ball": 1.0, "Anticipation": 0.95, "Composure": 0.9, "First Touch": 0.85, "Decisions": 0.85 },
      "support": { "Heading": 0.7, "Jumping Reach": 0.65, "Acceleration": 0.55, "Strength": 0.55, "Balance": 0.5, "Technique": 0.45 },
      "accent": { "Bravery": 0.3, "Pace": 0.25, "Teamwork": 0.25, "Determination": 0.2 },
      "gateAttributes": ["Finishing", "Off The Ball", "Anticipation", "Composure", "First Touch"]
    },
    {
      "id": "final_third_craft",
      "label": "Transition Security",
      "shortMeaning": "Can the player protect the team after possession is lost, stop counters early and keep the centre secure?",
      "description": "High scores point to players who can protect the team after possession is lost, stop counters early and keep the centre secure. Lower scores suggest the team may attack well but become exposed when the ball turns over.",
      "coachQuestions": ["Who protects the team after ball loss?", "Can the squad stop counters before they become dangerous?"],
      "core": { "Positioning": 1.0, "Anticipation": 1.0, "Decisions": 0.95, "Tackling": 0.95, "Work Rate": 0.9, "Teamwork": 0.9, "Concentration": 0.9 },
      "support": { "Aggression": 0.65, "Stamina": 0.6, "Strength": 0.55, "Acceleration": 0.5, "Marking": 0.45, "Bravery": 0.4, "Determination": 0.35 },
      "accent": { "Pace": 0.3, "Balance": 0.3, "Composure": 0.25, "Passing": 0.25 },
      "gateAttributes": ["Positioning", "Anticipation", "Decisions", "Tackling", "Concentration", "Teamwork"]
    },
    {
      "id": "no6_profile",
      "label": "No. 6 Profile",
      "shortMeaning": "Who can anchor play centrally, protect the line in front and keep the team connected on the ball.",
      "description": "High scores point to players who can receive under pressure, hold central balance and make good choices from the base of midfield. Lower scores suggest the central platform may need to be shared rather than placed on one player.",
      "coachQuestions": ["Do we have a real single-anchor profile?", "Is central security strong enough to rely on one controller?"],
      "core": { "Positioning": 1.05, "Anticipation": 1.0, "Decisions": 1.0, "Composure": 0.95, "Passing": 0.9, "First Touch": 0.85 },
      "support": { "Teamwork": 0.65, "Tackling": 0.6, "Concentration": 0.55, "Balance": 0.5 },
      "accent": { "Vision": 0.35, "Strength": 0.35, "Technique": 0.3, "Stamina": 0.25 },
      "gateAttributes": ["Positioning", "Decisions", "Passing", "Composure"],
      "depthRules": [
        { "minimumStrongFits": 2, "reading": "Single-anchor structure has real depth." },
        { "minimumStrongFits": 1, "reading": "Single-anchor structure is possible but fragile." },
        { "minimumStrongFits": 0, "reading": "Central load should be shared more than anchored." }
      ]
    },
    {
      "id": "wing_play",
      "label": "Wing Play",
      "shortMeaning": "Can the player stretch the pitch wide, carry the ball at speed down the flank and deliver end product?",
      "description": "High scores point to players who can receive wide, beat a full-back, carry the ball into advanced areas and deliver a cross or cut inside to shoot.",
      "coachQuestions": ["Who can stretch the pitch from wide areas?", "Can the squad deliver consistent wide threat?"],
      "core": { "Pace": 1.1, "Acceleration": 1.05, "Dribbling": 1.0, "Crossing": 0.95, "Agility": 0.9, "Technique": 0.85 },
      "support": { "Off The Ball": 0.65, "Stamina": 0.6, "First Touch": 0.55, "Balance": 0.5, "Decisions": 0.45 },
      "accent": { "Flair": 0.35, "Teamwork": 0.3, "Work Rate": 0.3, "Anticipation": 0.25 },
      "gateAttributes": ["Pace", "Acceleration", "Dribbling", "Crossing"]
    },
    {
      "id": "crosser_profile",
      "label": "Crossing Specialist",
      "shortMeaning": "Can the player deliver accurate crosses from wide or deep positions into the penalty area?",
      "description": "High scores point to players who can deliver accurate, well-timed crosses from different angles and under pressure.",
      "coachQuestions": ["Who can deliver dangerous crosses consistently?", "Does the squad have enough crossing quality from wide areas?"],
      "core": { "Crossing": 1.15, "Technique": 1.0, "Vision": 0.95, "Passing": 0.9, "First Touch": 0.85, "Decisions": 0.85 },
      "support": { "Pace": 0.6, "Dribbling": 0.55, "Teamwork": 0.5, "Composure": 0.45, "Anticipation": 0.45 },
      "accent": { "Acceleration": 0.35, "Off The Ball": 0.3, "Balance": 0.3, "Stamina": 0.25 },
      "gateAttributes": ["Crossing", "Technique", "Vision", "Passing"]
    },
    {
      "id": "playmaker_profile",
      "label": "Playmaker",
      "shortMeaning": "Can the player control the tempo, find passes others cannot see and connect the team?",
      "description": "High scores point to players who can dictate the rhythm, pick the right pass under pressure and make the team play through them.",
      "coachQuestions": ["Do we have a player who can dictate the game?", "Can someone consistently find the pass that opens the defence?"],
      "core": { "Vision": 1.15, "Passing": 1.1, "First Touch": 1.0, "Composure": 0.95, "Decisions": 0.95, "Technique": 0.9 },
      "support": { "Teamwork": 0.65, "Flair": 0.6, "Anticipation": 0.55, "Balance": 0.5, "Concentration": 0.45 },
      "accent": { "Dribbling": 0.35, "Off The Ball": 0.3, "Agility": 0.3, "Long Shots": 0.25 },
      "gateAttributes": ["Vision", "Passing", "First Touch", "Composure", "Decisions"]
    },
    {
      "id": "cut_inside",
      "label": "Cut Inside Threat",
      "shortMeaning": "Can the player receive wide, cut inside and create shots or through balls from half-spaces?",
      "description": "High scores point to players who can start wide, drive inside past defenders and create dangerous shooting or passing angles.",
      "coachQuestions": ["Who can cut inside and threaten the goal?", "Does the squad have inverted wingers who can shoot or create from half-spaces?"],
      "core": { "Dribbling": 1.1, "Finishing": 1.0, "Acceleration": 0.95, "Agility": 0.95, "Technique": 0.9, "Composure": 0.85 },
      "support": { "Decisions": 0.7, "Long Shots": 0.65, "First Touch": 0.6, "Flair": 0.55, "Off The Ball": 0.5 },
      "accent": { "Balance": 0.35, "Vision": 0.3, "Passing": 0.3, "Pace": 0.25 },
      "gateAttributes": ["Dribbling", "Finishing", "Acceleration", "Technique"]
    }
  ],
  "contextOnlyAttributes": ["Leadership", "Determination"],
  "notes": [
    "Leadership and Determination matter in squad building, but they should not drive the style-lens score itself.",
    "Set-piece attributes can appear as accents, not as core style drivers.",
    "Each lens should show all outfield players ranked on the relevant attributes for that single lens."
  ]
}`);
const FALLBACK_SAMPLE_PLAYERS = [
  { "Name": "Nadir Zortea", "Position": "D (R)", "Age": 26, "Acceleration": 14, "Agility": 14, "Balance": 12, "Jumping Reach": 10, "Natural Fitness": 14, "Pace": 14, "Stamina": 14, "Strength": 13, "Aggression": 14, "Anticipation": 13, "Bravery": 11, "Composure": 11, "Concentration": 12, "Decisions": 12, "Determination": 13, "Flair": 8, "Leadership": 12, "Off The Ball": 14, "Positioning": 11, "Teamwork": 14, "Vision": 13, "Work Rate": 13, "Corners": 7, "Crossing": 15, "Dribbling": 14, "First Touch": 12, "Free Kick Taking": 5, "Heading": 10, "Long Shots": 13, "Long Throws": 13, "Marking": 10, "Passing": 12, "Penalty Taking": 6, "Tackling": 12, "Technique": 13, "Finishing": 12 },
  { "Name": "Torbirn Heggem", "Position": "D (C)", "Age": 27, "Acceleration": 14, "Agility": 12, "Balance": 14, "Jumping Reach": 15, "Natural Fitness": 13, "Pace": 12, "Stamina": 13, "Strength": 13, "Aggression": 10, "Anticipation": 14, "Bravery": 14, "Composure": 13, "Concentration": 14, "Decisions": 13, "Determination": 13, "Flair": 6, "Leadership": 12, "Off The Ball": 7, "Positioning": 15, "Teamwork": 13, "Vision": 10, "Work Rate": 14, "Corners": 3, "Crossing": 9, "Dribbling": 9, "First Touch": 12, "Free Kick Taking": 3, "Heading": 14, "Long Shots": 7, "Long Throws": 11, "Marking": 14, "Passing": 10, "Penalty Taking": 4, "Tackling": 14, "Technique": 12, "Finishing": 5 },
  { "Name": "Jhon Lucumi", "Position": "D (C)", "Age": 27, "Acceleration": 14, "Agility": 12, "Balance": 17, "Jumping Reach": 13, "Natural Fitness": 16, "Pace": 14, "Stamina": 15, "Strength": 15, "Aggression": 15, "Anticipation": 16, "Bravery": 14, "Composure": 13, "Concentration": 12, "Decisions": 11, "Determination": 13, "Flair": 13, "Leadership": 13, "Off The Ball": 13, "Positioning": 16, "Teamwork": 14, "Vision": 13, "Work Rate": 14, "Corners": 5, "Crossing": 12, "Dribbling": 12, "First Touch": 12, "Free Kick Taking": 5, "Heading": 12, "Long Shots": 8, "Long Throws": 11, "Marking": 15, "Passing": 15, "Penalty Taking": 8, "Tackling": 16, "Technique": 13, "Finishing": 7 },
  { "Name": "Tommaso Pobega", "Position": "M (C)", "Age": 26, "Acceleration": 12, "Agility": 13, "Balance": 14, "Jumping Reach": 14, "Natural Fitness": 13, "Pace": 13, "Stamina": 14, "Strength": 15, "Aggression": 14, "Anticipation": 14, "Bravery": 13, "Composure": 12, "Concentration": 12, "Decisions": 13, "Determination": 13, "Flair": 8, "Leadership": 10, "Off The Ball": 15, "Positioning": 13, "Teamwork": 16, "Vision": 12, "Work Rate": 13, "Corners": 7, "Crossing": 11, "Dribbling": 11, "First Touch": 13, "Free Kick Taking": 7, "Heading": 13, "Long Shots": 15, "Long Throws": 11, "Marking": 13, "Passing": 12, "Penalty Taking": 11, "Tackling": 14, "Technique": 12, "Finishing": 12 },
  { "Name": "Riccardo Orsolini", "Position": "AM (R)", "Age": 28, "Acceleration": 15, "Agility": 15, "Balance": 14, "Jumping Reach": 14, "Natural Fitness": 14, "Pace": 15, "Stamina": 15, "Strength": 15, "Aggression": 15, "Anticipation": 16, "Bravery": 14, "Composure": 13, "Concentration": 11, "Decisions": 10, "Determination": 17, "Flair": 16, "Leadership": 10, "Off The Ball": 13, "Positioning": 6, "Teamwork": 9, "Vision": 12, "Work Rate": 14, "Corners": 16, "Crossing": 15, "Dribbling": 16, "First Touch": 16, "Free Kick Taking": 15, "Heading": 14, "Long Shots": 15, "Long Throws": 5, "Marking": 4, "Passing": 13, "Penalty Taking": 15, "Tackling": 6, "Technique": 17, "Finishing": 16 },
  { "Name": "Benjamin Dominguez", "Position": "AM (L)", "Age": 22, "Acceleration": 16, "Agility": 15, "Balance": 16, "Jumping Reach": 8, "Natural Fitness": 12, "Pace": 13, "Stamina": 13, "Strength": 7, "Aggression": 13, "Anticipation": 12, "Bravery": 12, "Composure": 13, "Concentration": 12, "Decisions": 11, "Determination": 12, "Flair": 16, "Leadership": 9, "Off The Ball": 11, "Positioning": 5, "Teamwork": 13, "Vision": 12, "Work Rate": 12, "Corners": 10, "Crossing": 12, "Dribbling": 16, "First Touch": 14, "Free Kick Taking": 10, "Heading": 7, "Long Shots": 13, "Long Throws": 6, "Marking": 4, "Passing": 12, "Penalty Taking": 11, "Tackling": 6, "Technique": 15, "Finishing": 12 },
  { "Name": "Thijs Dallinga", "Position": "ST (C)", "Age": 25, "Acceleration": 13, "Agility": 13, "Balance": 14, "Jumping Reach": 15, "Natural Fitness": 13, "Pace": 13, "Stamina": 14, "Strength": 12, "Aggression": 9, "Anticipation": 15, "Bravery": 6, "Composure": 12, "Concentration": 12, "Decisions": 10, "Determination": 9, "Flair": 13, "Leadership": 7, "Off The Ball": 15, "Positioning": 7, "Teamwork": 13, "Vision": 12, "Work Rate": 12, "Corners": 8, "Crossing": 7, "Dribbling": 12, "First Touch": 13, "Free Kick Taking": 8, "Heading": 15, "Long Shots": 12, "Long Throws": 6, "Marking": 5, "Passing": 12, "Penalty Taking": 13, "Tackling": 6, "Technique": 14, "Finishing": 15 },
  { "Name": "Lewis Ferguson", "Position": "M (C)", "Age": 26, "Acceleration": 12, "Agility": 11, "Balance": 14, "Jumping Reach": 13, "Natural Fitness": 16, "Pace": 12, "Stamina": 17, "Strength": 15, "Aggression": 16, "Anticipation": 13, "Bravery": 14, "Composure": 13, "Concentration": 13, "Decisions": 14, "Determination": 16, "Flair": 10, "Leadership": 14, "Off The Ball": 14, "Positioning": 15, "Teamwork": 15, "Vision": 12, "Work Rate": 17, "Corners": 12, "Crossing": 9, "Dribbling": 13, "First Touch": 12, "Free Kick Taking": 8, "Heading": 15, "Long Shots": 13, "Long Throws": 7, "Marking": 13, "Passing": 14, "Penalty Taking": 15, "Tackling": 14, "Technique": 13, "Finishing": 12 }
];

const ATTRIBUTE_FAMILIES = {
  Technical: [
    "Crossing",
    "Dribbling",
    "Finishing",
    "First Touch",
    "Heading",
    "Long Shots",
    "Marking",
    "Passing",
    "Tackling",
    "Technique"
  ],
  "Set Pieces": ["Corners", "Free Kick Taking", "Long Throws", "Penalty Taking"],
  Mental: [
    "Aggression",
    "Anticipation",
    "Bravery",
    "Composure",
    "Concentration",
    "Decisions",
    "Determination",
    "Flair",
    "Leadership",
    "Off The Ball",
    "Positioning",
    "Teamwork",
    "Vision",
    "Work Rate"
  ],
  Physical: [
    "Acceleration",
    "Agility",
    "Balance",
    "Jumping Reach",
    "Natural Fitness",
    "Pace",
    "Stamina",
    "Strength"
  ]
};

const ALL_ATTRIBUTES = Object.values(ATTRIBUTE_FAMILIES).flat();

const ATTRIBUTE_SHORT_LABELS = {
  Acceleration: "Accel",
  Aggression: "Agg",
  Agility: "Agil",
  Anticipation: "Antic",
  Balance: "Bal",
  Bravery: "Brave",
  Composure: "Comp",
  Concentration: "Conc",
  Corners: "Corn",
  Crossing: "Cross",
  Decisions: "Dec",
  Determination: "Det",
  Dribbling: "Drib",
  Finishing: "Fin",
  "First Touch": "Touch",
  Flair: "Flair",
  "Free Kick Taking": "FK",
  Heading: "Head",
  "Jumping Reach": "Jump",
  Leadership: "Lead",
  "Long Shots": "L Shot",
  "Long Throws": "L Throw",
  Marking: "Mark",
  "Natural Fitness": "Nat Fit",
  "Off The Ball": "OTB",
  Pace: "Pace",
  Passing: "Pass",
  "Penalty Taking": "Pens",
  Positioning: "Pos",
  Stamina: "Stam",
  Strength: "Str",
  Tackling: "Tack",
  Teamwork: "Team",
  Technique: "Tech",
  Vision: "Vis",
  "Work Rate": "Work"
};

const LENS_UI_META = {
  pressing_capacity: {
    category: "Defending - Team structure",
    toneClass: "tone-green",
    summary: "Shows how well the squad can press, counter-press and repeat high-intensity work."
  },
  line_height_control: {
    category: "Defending - Team structure",
    toneClass: "tone-teal",
    summary: "Shows whether the team can defend space behind the line without losing control."
  },
  box_defence: {
    category: "Defending - Team structure",
    toneClass: "tone-green",
    summary: "Shows who can defend deep around the penalty area when the team has to absorb pressure."
  },
  ball_retention: {
    category: "Attacking - Team structure",
    toneClass: "tone-cyan",
    summary: "Shows how secure the squad is when it has to keep the ball under pressure."
  },
  vertical_progression: {
    category: "Attacking - Team structure",
    toneClass: "tone-blue",
    summary: "Shows who can turn regains and early openings into quick forward attacks before the defence resets."
  },
  one_v_one_threat: {
    category: "Attacking - Player threats",
    toneClass: "tone-amber",
    summary: "Shows which players can eliminate a defender and break the structure on their own."
  },
  running_threat: {
    category: "Attacking - Team structure",
    toneClass: "tone-cyan",
    summary: "Shows who can provide the final ball, combine in tight areas or create the action that opens the defence."
  },
  penalty_area_presence: {
    category: "Attacking - Player threats",
    toneClass: "tone-gold",
    summary: "Shows who can arrive in scoring zones and turn box entries into real shots and goals."
  },
  final_third_craft: {
    category: "Defending - Team structure",
    toneClass: "tone-teal",
    summary: "Shows who can react after ball loss, protect the centre and stop counters before they gather speed."
  },
  no6_profile: {
    category: "Defending - Player roles",
    toneClass: "tone-role",
    summary: "Shows who can hold the middle together and give the team a real No. 6 profile."
  },
  wing_play: {
    category: "Attacking - Wide play",
    toneClass: "tone-amber",
    summary: "Shows who can stretch the pitch, beat a full-back and deliver from wide areas."
  },
  crosser_profile: {
    category: "Attacking - Wide play",
    toneClass: "tone-gold",
    summary: "Shows who can deliver dangerous crosses consistently from wide or deep positions."
  },
  playmaker_profile: {
    category: "Attacking - Creative roles",
    toneClass: "tone-violet",
    summary: "Shows who can dictate tempo, find the decisive pass and make the team play through them."
  },
  cut_inside: {
    category: "Attacking - Wide play",
    toneClass: "tone-amber",
    summary: "Shows who can start wide, cut inside and create shooting or passing chances from half-spaces."
  }
};

const SITUATION_GROUPS = [
  {
    id: "defending-team",
    title: "Defending - Team structure",
    helper: "Test how your squad defends space, pressure and transitions as a unit.",
    accentClass: "group-defending-team",
    lensIds: ["pressing_capacity", "line_height_control", "box_defence", "final_third_craft"]
  },
  {
    id: "defending-roles",
    title: "Defending - Player roles",
    helper: "Find players who can carry specific defensive responsibilities.",
    accentClass: "group-defending-role",
    lensIds: ["no6_profile"]
  },
  {
    id: "attacking-team",
    title: "Attacking - Team structure",
    helper: "Test how your squad keeps the ball, moves forward and creates chances.",
    accentClass: "group-attacking-team",
    lensIds: ["ball_retention", "vertical_progression", "running_threat"]
  },
  {
    id: "attacking-threats",
    title: "Attacking - Player threats",
    helper: "Find players who can create danger through individual qualities or specialist attacking roles.",
    accentClass: "group-attacking-threat",
    lensIds: ["one_v_one_threat", "penalty_area_presence"]
  },
  {
    id: "attacking-wide",
    title: "Attacking - Wide play",
    helper: "Test who can carry, cross or cut inside from wide positions.",
    accentClass: "group-attacking-wide",
    lensIds: ["wing_play", "crosser_profile", "cut_inside"]
  },
  {
    id: "attacking-creative",
    title: "Attacking - Creative roles",
    helper: "Find players who can control the game through vision, passing and creativity.",
    accentClass: "group-attacking-creative",
    lensIds: ["playmaker_profile"]
  }
];

const state = {
  lensConfig: null,
  players: [],
  activeLensId: null,
  selectedPlayerName: null,
  query: "",
  positionFilter: "all",
  dataSource: "No squad loaded",
  focusMode: false,
  hasChosenSituation: false
};

const els = {
  playerCountPill: document.getElementById("playerCountPill"),
  dataSourcePill: document.getElementById("dataSourcePill"),
  activeSituationPill: document.getElementById("activeSituationPill"),
  statusMessage: document.getElementById("statusMessage"),
  csvInput: document.getElementById("csvInput"),
  stickyUploadBtn: document.getElementById("stickyUploadBtn"),
  manualEntryBtn: document.getElementById("manualEntryBtn"),
  exportBtn: document.getElementById("exportBtn"),
  sampleBtn: document.getElementById("sampleBtn"),
  jumpToSituationsBtn: document.getElementById("jumpToSituationsBtn"),
  jumpToAnalysisBtn: document.getElementById("jumpToAnalysisBtn"),
  jumpToRankingBtn: document.getElementById("jumpToRankingBtn"),
  emptyStateSection: document.getElementById("emptyStateSection"),
  emptyUploadBtn: document.getElementById("emptyUploadBtn"),
  emptySampleBtn: document.getElementById("emptySampleBtn"),
  emptyManualBtn: document.getElementById("emptyManualBtn"),
  searchInput: document.getElementById("searchInput"),
  introOverviewSection: document.getElementById("introOverviewSection"),
  pageGrid: document.getElementById("pageGrid"),
  lensDirectorySection: document.getElementById("lensDirectorySection"),
  detailSection: document.getElementById("detailSection"),
  rankingSection: document.getElementById("rankingSection"),
  sideColumn: document.getElementById("sideColumn"),
  squadOverviewSection: document.getElementById("squadOverviewSection"),
  squadOverviewContent: document.getElementById("squadOverviewContent"),
  positionFilters: document.getElementById("positionFilters"),
  jumpToOverviewBtn: document.getElementById("jumpToOverviewBtn"),
  lensGrid: document.getElementById("lensGrid"),
  detailHeader: document.getElementById("detailHeader"),
  kpiGrid: document.getElementById("kpiGrid"),
  insightRow: document.getElementById("insightRow"),
  topFitsSection: document.getElementById("topFitsSection"),
  detailContextRow: document.getElementById("detailContextRow"),
  rankingTable: document.getElementById("rankingTable"),
  selectedPlayerPanel: document.getElementById("selectedPlayerPanel"),
  manualModal: document.getElementById("manualModal"),
  closeManualModal: document.getElementById("closeManualModal"),
  cancelManualEntry: document.getElementById("cancelManualEntry"),
  manualGroups: document.getElementById("manualGroups"),
  manualForm: document.getElementById("manualForm")
};

bootstrap();

async function bootstrap() {
  bindEvents();
  buildManualEntryForm();

  try {
    const lensConfig = await fetchJson(DEFAULT_LENSES).catch(() => FALLBACK_LENS_CONFIG);
    state.lensConfig = lensConfig;
    state.activeLensId = lensConfig.lenses[0]?.id || null;

    const saved = loadSavedPlayers();
    if (saved.length) {
      state.players = saved;
      state.dataSource = "Saved squad";
      setStatus("Loaded saved squad.", "good");
    } else {
      state.players = [];
      state.dataSource = "No squad loaded";
      setStatus("No squad loaded. Upload a squad or try the sample squad.", "neutral");
    }

    ensureSelectedPlayer();
    render();
  } catch (error) {
    console.error(error);
    setStatus("Could not load analysis models.", "bad");
    els.lensGrid.innerHTML = `<div class="empty-state">The analysis models could not be loaded.</div>`;
  }
}

function bindEvents() {
  els.csvInput.addEventListener("change", handleCsvUpload);
  els.stickyUploadBtn?.addEventListener("click", () => els.csvInput.click());
  els.emptyUploadBtn?.addEventListener("click", () => els.csvInput.click());
  els.sampleBtn?.addEventListener("click", activateSampleSquad);
  els.emptySampleBtn?.addEventListener("click", activateSampleSquad);
  els.exportBtn.addEventListener("click", exportCurrentSquad);
  els.manualEntryBtn.addEventListener("click", openManualModal);
  els.emptyManualBtn?.addEventListener("click", openManualModal);
  els.closeManualModal.addEventListener("click", closeManualModal);
  els.cancelManualEntry.addEventListener("click", closeManualModal);
  els.manualModal.addEventListener("click", (event) => {
    if (event.target === els.manualModal) closeManualModal();
  });
  els.manualForm.addEventListener("submit", handleManualSubmit);
  els.searchInput.addEventListener("input", (event) => {
    state.query = event.target.value.trim();
    ensureSelectedPlayer();
    render();
  });
  els.jumpToSituationsBtn?.addEventListener("click", () => {
    scrollToSection(els.lensDirectorySection);
  });
  els.jumpToOverviewBtn?.addEventListener("click", () => {
    if (!state.players.length) {
      scrollToSection(els.emptyStateSection);
      return;
    }
    scrollToSection(els.squadOverviewSection);
  });
  els.jumpToAnalysisBtn?.addEventListener("click", () => {
    if (!state.players.length) {
      scrollToSection(els.emptyStateSection);
      return;
    }
    if (!state.focusMode) {
      state.focusMode = true;
      ensureSelectedPlayer();
      render();
    }
    scrollToSection(els.detailSection);
  });
  els.jumpToRankingBtn?.addEventListener("click", () => {
    if (!state.players.length) {
      scrollToSection(els.emptyStateSection);
      return;
    }
    if (!state.focusMode) {
      state.focusMode = true;
      ensureSelectedPlayer();
      render();
    }
    scrollToSection(els.rankingSection);
  });
}

function buildManualEntryForm() {
  els.manualGroups.innerHTML = Object.entries(ATTRIBUTE_FAMILIES)
    .map(
      ([group, attributes]) => `
        <section class="manual-group">
          <div class="manual-group-head">
            <div>
              <h3>${escapeHtml(group)}</h3>
              <p>Enter only the values needed from your Football Manager export or screenshots.</p>
            </div>
          </div>
          <div class="manual-attribute-grid">
            ${attributes
              .map(
                (attribute) => `
                  <div class="mini-field">
                    <label for="manual-${slug(attribute)}">${escapeHtml(attribute)}</label>
                    <input
                      id="manual-${slug(attribute)}"
                      name="${escapeHtml(attribute)}"
                      type="number"
                      min="1"
                      max="20"
                      value="10"
                    />
                  </div>
                `
              )
              .join("")}
          </div>
        </section>
      `
    )
    .join("");
}

async function loadSampleSquad() {
  try {
    const sampleText = await fetchText(DEFAULT_CSV);
    state.players = parseSquadCsv(sampleText);
    state.dataSource = "Sample squad";
  } catch {
    state.players = FALLBACK_SAMPLE_PLAYERS.map(normalizePlayer);
    state.dataSource = "Embedded sample squad";
  }
  ensureSelectedPlayer();
}

async function handleCsvUpload(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  try {
    const text = await file.text();
    const parsed = parseSquadCsv(text);
    if (!parsed.length) {
      setStatus("No valid outfield data was found in that CSV.", "bad");
      return;
    }
    state.players = parsed;
    state.dataSource = file.name;
    ensureSelectedPlayer();
    savePlayers();
    render();
    setStatus(`Loaded ${parsed.length} players from ${file.name}.`, "good");
  } catch (error) {
    console.error(error);
    setStatus("CSV import failed. Check the file headers and delimiter.", "bad");
  } finally {
    event.target.value = "";
  }
}

function handleManualSubmit(event) {
  event.preventDefault();
  const formData = new FormData(els.manualForm);
  const player = {
    Name: String(formData.get("Name") || "").trim(),
    Position: String(formData.get("Position") || "").trim(),
    Age: normalizeAge(formData.get("Age"))
  };

  if (!player.Name) {
    setStatus("A player name is required for manual entry.", "bad");
    return;
  }

  for (const attribute of ALL_ATTRIBUTES) {
    player[attribute] = clampAttribute(formData.get(attribute));
  }

  const existingIndex = state.players.findIndex((item) => item.Name.toLowerCase() === player.Name.toLowerCase());
  if (existingIndex >= 0) {
    state.players[existingIndex] = normalizePlayer(player);
  } else {
    state.players.push(normalizePlayer(player));
  }

  state.dataSource = state.dataSource === "Sample squad" ? "Manual squad" : `${state.dataSource} + manual edits`;
  state.selectedPlayerName = player.Name;
  savePlayers();
  closeManualModal();
  render();
  setStatus(`Added ${player.Name} to the squad.`, "good");
}

function openManualModal() {
  els.manualForm.reset();
  for (const input of els.manualForm.querySelectorAll('input[type="number"]')) {
    if (input.name !== "Age") input.value = "10";
  }
  els.manualModal.classList.remove("hidden");
  els.manualModal.setAttribute("aria-hidden", "false");
}

function closeManualModal() {
  els.manualModal.classList.add("hidden");
  els.manualModal.setAttribute("aria-hidden", "true");
}

function render() {
  if (!state.lensConfig) return;
  if (!state.players.length) state.focusMode = false;
  const lens = getActiveLens();
  const analysis = analyzeLens(lens);

  els.playerCountPill.textContent = `${state.players.length} players`;
  els.dataSourcePill.textContent = state.dataSource;
  els.searchInput.value = state.query;
  els.searchInput.disabled = !state.players.length;
  els.exportBtn.disabled = !state.players.length;
  els.jumpToAnalysisBtn.disabled = !state.players.length;
  els.jumpToRankingBtn.disabled = !state.players.length;
  els.jumpToOverviewBtn.disabled = !state.players.length;
  if (els.emptySampleBtn) {
    els.emptySampleBtn.disabled = false;
  }
  els.activeSituationPill.classList.toggle("hidden-view", !(state.focusMode && lens && state.players.length));
  if (state.focusMode && lens && state.players.length) {
    els.activeSituationPill.textContent = `Active: ${lens.label}`;
  }

  toggleFocusLayout();
  renderSquadOverview();
  renderPositionFilters();
  renderLensGrid();
  if (state.focusMode && state.players.length) {
    renderDetailHeader(lens, analysis);
    renderKpis(analysis);
    renderInsights(lens, analysis);
    renderTopFits(lens, analysis);
    renderDetailContext(lens, analysis);
    renderRankingTable(lens, analysis);
    renderSelectedPlayer(lens, analysis);
  } else {
    els.detailHeader.innerHTML = "";
    els.kpiGrid.innerHTML = "";
    els.insightRow.innerHTML = "";
    els.topFitsSection.innerHTML = "";
    els.detailContextRow.innerHTML = "";
    els.rankingTable.innerHTML = "";
    els.selectedPlayerPanel.innerHTML = "";
  }
}

function toggleFocusLayout() {
  const hasPlayers = state.players.length > 0;
  els.pageGrid.classList.toggle("page-grid-focus", state.focusMode && hasPlayers);
  els.introOverviewSection.classList.toggle("hidden-view", state.focusMode && hasPlayers);
  els.emptyStateSection.classList.toggle("hidden-view", hasPlayers);
  els.squadOverviewSection.classList.toggle("hidden-view", !hasPlayers);
  els.lensDirectorySection.classList.remove("hidden-view");
  els.detailSection.classList.toggle("hidden-view", !(state.focusMode && hasPlayers));
  els.rankingSection.classList.toggle("hidden-view", !(state.focusMode && hasPlayers));
  els.sideColumn.classList.toggle("hidden-view", !(state.focusMode && hasPlayers));
}

function renderLensGrid() {
  const groupedMarkup = SITUATION_GROUPS.map((group) => {
    const groupLenses = group.lensIds
      .map((lensId) => state.lensConfig.lenses.find((lens) => lens.id === lensId))
      .filter(Boolean);
    if (!groupLenses.length) return "";

    return `
      <section class="situation-group ${escapeHtml(group.accentClass)}">
        <div class="situation-group-head">
          <div>
            <h3>${escapeHtml(group.title)}</h3>
            <p>${escapeHtml(group.helper)}</p>
          </div>
        </div>
        <div class="situation-card-grid">
          ${groupLenses.map((lens) => renderSituationCard(lens)).join("")}
        </div>
      </section>
    `;
  }).join("");

  els.lensGrid.innerHTML = groupedMarkup || `<div class="empty-state">No match situations available.</div>`;
  els.lensGrid.querySelectorAll("[data-lens-id]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeLensId = button.dataset.lensId;
      state.hasChosenSituation = true;
      if (!state.players.length) {
        state.focusMode = false;
        render();
        setStatus("Load a squad to analyse this match situation.", "neutral");
        scrollToSection(els.emptyStateSection);
        return;
      }
      state.focusMode = true;
      ensureSelectedPlayer();
      render();
      focusDetailView();
    });
  });
}

function renderSituationCard(lens) {
  const analysis = analyzeLens(lens);
  const best = analysis.ranked[0];
  const hasPlayers = analysis.ranked.length > 0;
  const teamAverage = hasPlayers ? formatScore(analysis.teamAverage) : "--";
  const activeClass = lens.id === state.activeLensId && (state.focusMode || state.hasChosenSituation) ? "active" : "";
  const uiMeta = LENS_UI_META[lens.id] || {
    category: "Match situation",
    toneClass: "tone-cyan",
    summary: lens.shortMeaning
  };

  return `
    <button class="lens-card ${activeClass} ${escapeHtml(uiMeta.toneClass)}" type="button" data-lens-id="${escapeHtml(lens.id)}">
      <div class="lens-card-top">
        <div>
          <div class="lens-card-badge-row">
            <span class="lens-category-badge ${escapeHtml(uiMeta.toneClass)}">${escapeHtml(uiMeta.category)}</span>
            ${activeClass ? `<span class="lens-active-pill">Active</span>` : ""}
          </div>
          <div class="lens-card-title">${escapeHtml(lens.label)}</div>
        </div>
        <div class="lens-score-block">
          <div class="lens-card-score-label">${hasPlayers ? "Squad avg" : "Awaiting squad"}</div>
          <div class="lens-card-score">${teamAverage}</div>
        </div>
      </div>
      <p class="lens-card-copy">${escapeHtml(lens.shortMeaning)}</p>
      <div class="lens-tag-row">
        ${(lens.coachQuestions || [])
          .slice(0, 2)
          .map((question) => `<span class="lens-focus-tag">${escapeHtml(question)}</span>`)
          .join("")}
      </div>
      ${
        hasPlayers
          ? `
      <div class="lens-card-meta">
        <div class="lens-mini">
          <div class="lens-mini-label">Squad leader</div>
          <div class="lens-mini-value">${best ? escapeHtml(best.Name) : "-"}</div>
        </div>
        <div class="lens-mini">
          <div class="lens-mini-label">Key strength</div>
          <div class="lens-mini-value">${escapeHtml(analysis.carryAttribute?.name || "-")}</div>
        </div>
        <div class="lens-mini">
          <div class="lens-mini-label">Main drag</div>
          <div class="lens-mini-value">${escapeHtml(analysis.limitingAttribute?.name || "-")}</div>
        </div>
      </div>
      `
          : `<div class="lens-card-empty-note">Load a squad to compare player fit in this situation.</div>`
      }
    </button>
  `;
}

async function activateSampleSquad() {
  await loadSampleSquad();
  savePlayers();
  setStatus("Sample squad restored.", "good");
  render();
}

function renderDetailHeader(lens, analysis) {
  const depthText = buildLensSummary(lens, analysis);
  els.detailHeader.innerHTML = `
    <div class="detail-header">
      <div class="detail-header-copy">
        <div class="detail-actions">
          <button class="btn" id="backToLensesBtn" type="button">&larr; Back to all match situations</button>
        </div>
        <div class="detail-kicker">Active situation</div>
        <h2>${escapeHtml(lens.label)}</h2>
        <p>${escapeHtml(lens.description)}</p>
        <div class="question-row">
          ${lens.coachQuestions.map((question) => `<span class="question-chip">${escapeHtml(question)}</span>`).join("")}
        </div>
      </div>
      <div class="detail-side-stat">
        <h3>Squad profile</h3>
        <p>${escapeHtml(depthText)}</p>
      </div>
    </div>
  `;
  document.getElementById("backToLensesBtn")?.addEventListener("click", () => {
    scrollToSection(els.lensDirectorySection);
  });
}

function renderKpis(analysis) {
  const best = analysis.ranked[0];
  const weakest = analysis.ranked[analysis.ranked.length - 1];
  const medianPlayer = analysis.ranked[Math.floor((analysis.ranked.length - 1) / 2)];
  const spread = best && weakest ? best.lensScore - weakest.lensScore : 0;
  const kpis = [
    {
      label: "Squad average",
      value: formatScore(analysis.teamAverage),
      sub: "Average player fit for this situation across the squad."
    },
    {
      label: "Best fit",
      value: best ? formatScore(best.lensScore) : "-",
      sub: best ? `${best.Name} is the strongest profile for this situation.` : "No eligible players."
    },
    {
      label: "Weakest fit",
      value: weakest ? formatScore(weakest.lensScore) : "-",
      sub: weakest ? `${weakest.Name} is the weakest profile for this situation.` : "No eligible players."
    },
    {
      label: "Squad median",
      value: medianPlayer ? formatScore(medianPlayer.lensScore) : "-",
      sub: medianPlayer ? `${medianPlayer.Name} sits around the middle of the squad.` : "No middle point yet."
    },
    {
      label: "Main strength",
      value: analysis.carryAttribute ? formatScore(analysis.carryAttribute.average) : "-",
      sub: analysis.carryAttribute ? analysis.carryAttribute.name : "No clear strength yet."
    },
    {
      label: "Squad gap",
      value: formatScore(spread),
      sub: spread > 3.0 ? "Large gap — this situation depends heavily on a few leading players." : spread > 1.5 ? "Moderate gap — a clear upper tier exists but the squad still supports it." : "Small gap — fit is spread fairly evenly across the squad."
    }
  ];

  els.kpiGrid.innerHTML = kpis
    .map(
      (kpi) => `
        <article class="kpi-card">
          <div class="overline">${escapeHtml(kpi.label)}</div>
          <div class="value">${escapeHtml(kpi.value)}</div>
          <div class="sub">${escapeHtml(kpi.sub)}</div>
        </article>
      `
    )
    .join("");
}

function renderInsights(lens, analysis) {
  const insights = buildInsights(lens, analysis);
  els.insightRow.innerHTML = insights
    .map((item, index) => `<div class="insight ${index === 2 ? "insight-warning" : ""}">${escapeHtml(item)}</div>`)
    .join("");
}

function renderTopFits(lens, analysis) {
  const filteredForTopFits = filterRankedPlayers(analysis.ranked);
  const topPlayers = filteredForTopFits.slice(0, 5);
  if (!topPlayers.length) {
    els.topFitsSection.innerHTML = `
      <div class="section-head section-head-tight">
        <div>
          <h3>Top 5 player fits</h3>
          <p>No outfield players are available for this match situation.</p>
        </div>
      </div>
    `;
    return;
  }
  els.topFitsSection.innerHTML = `
    <div class="section-head section-head-tight">
      <div>
        <h3>Top 5 player fits</h3>
        <p>See the first profiles you would trust to carry this football demand.</p>
      </div>
    </div>
    <div class="top-fit-grid">
      ${topPlayers
        .map((player, index) => {
          const strengths = player.relevantAttributes
            .slice()
            .sort((left, right) => right.value - left.value)
            .slice(0, 2)
            .map((item) => item.name)
            .join(" and ");
          const activeClass = player.Name === state.selectedPlayerName ? "active" : "";
          return `
            <button class="top-fit-card ${activeClass}" type="button" data-top-fit="${escapeHtml(player.Name)}">
              <div class="top-fit-rank">#${index + 1}</div>
              <div class="top-fit-body">
                <div class="top-fit-name">${escapeHtml(player.Name)}</div>
                <div class="top-fit-meta">${escapeHtml(formatPlayerMeta(player))}</div>
                <div class="top-fit-copy">${escapeHtml(strengths || "No standout strengths yet.")}</div>
              </div>
              <div class="top-fit-score">${formatScore(player.lensScore)}</div>
            </button>
          `;
        })
        .join("")}
    </div>
  `;

  els.topFitsSection.querySelectorAll("[data-top-fit]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedPlayerName = button.dataset.topFit;
      renderTopFits(lens, analysis);
      renderSelectedPlayer(lens, analysis);
      highlightSelectedRow();
      scrollSelectedPlayerIntoView();
    });
  });
}

function renderDetailContext(lens, analysis) {
  const relevant = getRelevantAttributes(lens);
  const tierSections = [
    { tier: "core", label: "Main requirements", copy: "These attributes decide whether the player can handle this situation." },
    { tier: "support", label: "Supporting qualities", copy: "These attributes improve the player once the main requirements are in place." },
    { tier: "accent", label: "Context factors", copy: "These attributes can matter, but they should not decide the whole evaluation alone." }
  ];

  const attributeMarkup = tierSections
    .map((section) => {
      const attributes = relevant.filter((item) => item.tier === section.tier);
      if (!attributes.length) return "";
      return `
        <section class="context-tier">
          <div class="context-tier-head">
            <div class="context-tier-title">${escapeHtml(section.label)}</div>
            <div class="context-tier-copy">${escapeHtml(section.copy)}</div>
          </div>
          <div class="context-chip-grid">
            ${attributes
              .map((attribute) => {
                const average = analysis.attributeAverages[attribute.name];
                const leader = analysis.attributeLeaders[attribute.name];
                return `
                  <article class="context-chip context-chip-${attribute.tier}">
                    <div class="context-chip-name">${escapeHtml(attribute.name)}</div>
                    <div class="context-chip-meta">Squad avg ${formatScore(average)}</div>
                    <div class="context-chip-meta">${leader ? `${escapeHtml(leader.Name)} ${formatAttributeValue(leader[attribute.name])}` : "-"}</div>
                  </article>
                `;
              })
              .join("")}
          </div>
        </section>
      `;
    })
    .join("");

  els.detailContextRow.innerHTML = `
    <article class="context-panel">
      <div class="context-panel-head">
        <div>
          <h3>Attribute demands</h3>
          <p>These are the FM attributes used to judge this match situation.</p>
        </div>
      </div>
      ${attributeMarkup}
    </article>
  `;
}

function renderRankingTable(lens, analysis) {
  const relevantAttributes = getRelevantAttributes(lens);
  const filtered = filterRankedPlayers(analysis.ranked);
  const headers = `
    <thead>
      <tr>
        <th>#</th>
        <th>Player</th>
        <th>Player fit</th>
        ${relevantAttributes
          .map(
            (attribute) => `
              <th class="tier-head-${attribute.tier} attr-col-head" title="${escapeHtml(attribute.name)}">${escapeHtml(getAttributeShortLabel(attribute.name))}</th>
            `
          )
          .join("")}
      </tr>
    </thead>
  `;

  const rows = filtered
    .map((player, index) => {
      const selectedClass = player.Name === state.selectedPlayerName ? "selected" : "";
      return `
        <tr class="${selectedClass}" data-player-row="${escapeHtml(player.Name)}">
          <td class="rank-cell">${index + 1}</td>
          <td class="player-cell">
            <div class="player-name">${escapeHtml(player.Name)}</div>
            <div class="player-meta">${escapeHtml(formatPlayerMeta(player))}</div>
          </td>
          <td class="score-cell">
            <span class="score-badge ${player.band.className}">${formatScore(player.lensScore)}</span>
            <div class="score-band-text">${escapeHtml(player.band.label)}</div>
          </td>
          ${relevantAttributes
            .map(
              (attribute) => `
                <td class="attribute-cell">
                  <span class="value-chip ${valueClass(player[attribute.name])}">${formatAttributeValue(player[attribute.name])}</span>
                </td>
              `
            )
            .join("")}
        </tr>
      `;
    })
    .join("");
  els.rankingTable.innerHTML = headers + `<tbody>${rows || `<tr><td colspan="${relevantAttributes.length + 3}"><div class="empty-state">No players match the current search.</div></td></tr>`}</tbody>`;

  els.rankingTable.querySelectorAll("[data-player-row]").forEach((row) => {
    row.addEventListener("click", () => {
      state.selectedPlayerName = row.dataset.playerRow;
      renderTopFits(lens, analysis);
      renderSelectedPlayer(lens, analysis);
      highlightSelectedRow();
      scrollSelectedPlayerIntoView();
    });
  });
}



function renderSelectedPlayer(lens, analysis) {
  const player = analysis.ranked.find((item) => item.Name === state.selectedPlayerName) || analysis.ranked[0];
  if (!player) {
    els.selectedPlayerPanel.innerHTML = `<div class="empty-state">No outfield players available for this match situation.</div>`;
    return;
  }

  state.selectedPlayerName = player.Name;
  highlightSelectedRow();
  els.selectedPlayerPanel.innerHTML = renderSelectedPlayerSummary(lens, player);

  els.selectedPlayerPanel.querySelector("[data-delete-player]")?.addEventListener("click", () => {
    deletePlayer(player.Name);
  });
}

function renderSelectedPlayerSummary(lens, player) {
  const strengths = player.relevantAttributes
    .slice()
    .sort((left, right) => right.value - left.value)
    .slice(0, 3);
  const risks = player.relevantAttributes
    .slice()
    .sort((left, right) => left.value - right.value)
    .slice(0, 3);

  const radarSvg = renderPlayerRadar(player);

  return `
    <div class="selected-player-panel">
      <div class="selected-summary">
        <div>
          <h3>${escapeHtml(player.Name)}</h3>
          <p>${escapeHtml(formatPlayerMeta(player))}</p>
        </div>
        <div class="selected-score">
          <div class="big">${formatScore(player.lensScore)}</div>
          <div class="score-badge ${player.band.className}">${escapeHtml(player.band.label)}</div>
        </div>
      </div>

      <div class="selected-section">
        <h4>Player fit summary</h4>
        <p class="stack-copy">${escapeHtml(buildPlayerRead(lens, player))}</p>
      </div>

      <div class="selected-section">
        <h4>Fit breakdown</h4>
        <div class="layer-bars">
          ${renderLayerRow("Main", player.layerScores.core, "fill-core")}
          ${renderLayerRow("Support", player.layerScores.support, "fill-support")}
          ${renderLayerRow("Context", player.layerScores.accent, "fill-accent")}
        </div>
      </div>

      <div class="selected-section">
        <h4>All-lens profile</h4>
        <div class="radar-container">${radarSvg}</div>
      </div>

      <div class="selected-section">
        <h4>Strongest attributes here</h4>
        <div class="plain-list">
          ${strengths
            .map(
              (attribute) => `
                <div class="plain-list-item">
                  <span>${escapeHtml(attribute.name)}</span>
                  <span class="value-chip ${valueClass(attribute.value)}">${formatAttributeValue(attribute.value)}</span>
                </div>
              `
            )
            .join("")}
        </div>
      </div>

      <div class="selected-section">
        <h4>Weak points here</h4>
        <div class="plain-list">
          ${risks
            .map(
              (attribute) => `
                <div class="plain-list-item">
                  <span>${escapeHtml(attribute.name)}</span>
                  <span class="value-chip ${valueClass(attribute.value)}">${formatAttributeValue(attribute.value)}</span>
                </div>
              `
            )
            .join("")}
        </div>
      </div>

      <div class="selected-section selected-section-actions">
        <button class="btn btn-danger-subtle" type="button" data-delete-player="${escapeHtml(player.Name)}">Remove from squad</button>
      </div>
    </div>
  `;
}

function highlightSelectedRow() {
  els.rankingTable.querySelectorAll("[data-player-row]").forEach((row) => {
    row.classList.toggle("selected", row.dataset.playerRow === state.selectedPlayerName);
  });
}

function renderSquadOverview() {
  if (!state.players.length || !state.lensConfig) {
    els.squadOverviewContent.innerHTML = "";
    return;
  }

  const lensData = state.lensConfig.lenses.map((lens) => {
    const analysis = analyzeLens(lens);
    return {
      id: lens.id,
      label: lens.label,
      teamAverage: analysis.teamAverage,
      bestPlayer: analysis.ranked[0]?.Name || "-",
      bestScore: analysis.ranked[0]?.lensScore || 0,
      weakestPlayer: analysis.ranked[analysis.ranked.length - 1]?.Name || "-",
      weakestScore: analysis.ranked[analysis.ranked.length - 1]?.lensScore || 0
    };
  }).sort((a, b) => b.teamAverage - a.teamAverage);

  const maxScore = 20;

  els.squadOverviewContent.innerHTML = `
    <div class="overview-bar-chart">
      ${lensData.map((item) => {
        const pct = Math.max(0, Math.min(100, (item.teamAverage / maxScore) * 100));
        const uiMeta = LENS_UI_META[item.id] || { toneClass: "tone-cyan" };
        const barColor = getOverviewBarColor(item.teamAverage);
        return `
          <button class="overview-bar-row" type="button" data-overview-lens="${escapeHtml(item.id)}">
            <div class="overview-bar-label">${escapeHtml(item.label)}</div>
            <div class="overview-bar-track">
              <div class="overview-bar-fill ${barColor}" style="width:${pct}%"></div>
            </div>
            <div class="overview-bar-value">${formatScore(item.teamAverage)}</div>
            <div class="overview-bar-detail">
              <span class="overview-bar-best">${escapeHtml(item.bestPlayer)} ${formatScore(item.bestScore)}</span>
            </div>
          </button>
        `;
      }).join("")}
    </div>
  `;

  els.squadOverviewContent.querySelectorAll("[data-overview-lens]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.activeLensId = btn.dataset.overviewLens;
      state.hasChosenSituation = true;
      state.focusMode = true;
      ensureSelectedPlayer();
      render();
      focusDetailView();
    });
  });
}

function getOverviewBarColor(avg) {
  if (avg >= 14.5) return "bar-strong";
  if (avg >= 13.0) return "bar-good";
  if (avg >= 11.5) return "bar-working";
  return "bar-risk";
}

function renderPositionFilters() {
  if (!state.players.length) {
    els.positionFilters.innerHTML = "";
    return;
  }

  const positionKeys = new Set();
  positionKeys.add("all");
  for (const player of state.players) {
    const raw = String(player.Position || "").toUpperCase();
    if (raw.includes("D")) positionKeys.add("D");
    if (raw.includes("WB")) positionKeys.add("WB");
    if (raw.includes("DM")) positionKeys.add("DM");
    if (raw.includes("M") && !raw.includes("AM") && !raw.includes("DM")) positionKeys.add("M");
    if (raw.includes("AM")) positionKeys.add("AM");
    if (raw.includes("ST")) positionKeys.add("ST");
  }

  const labels = { all: "All", D: "DEF", WB: "WB", DM: "DM", M: "MID", AM: "AM", ST: "ST" };
  const orderedKeys = ["all", "D", "WB", "DM", "M", "AM", "ST"].filter((k) => positionKeys.has(k));

  els.positionFilters.innerHTML = orderedKeys
    .map((key) => {
      const active = state.positionFilter === key ? "active" : "";
      return `<button class="pos-filter-btn ${active}" type="button" data-pos-filter="${escapeHtml(key)}">${labels[key] || key}</button>`;
    })
    .join("");

  els.positionFilters.querySelectorAll("[data-pos-filter]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.positionFilter = btn.dataset.posFilter;
      ensureSelectedPlayer();
      render();
    });
  });
}

function renderPlayerRadar(player) {
  if (!state.lensConfig) return "";
  const lenses = state.lensConfig.lenses;
  const count = lenses.length;
  if (count < 3) return "";

  const cx = 140, cy = 140, maxR = 110;
  const angleStep = (2 * Math.PI) / count;

  const playerScores = lenses.map((lens) => {
    const scoreData = scorePlayerForLens(player, lens);
    return scoreData.lensScore;
  });

  const teamAverages = lenses.map((lens) => {
    const analysis = analyzeLens(lens);
    return analysis.teamAverage;
  });

  function polarToXY(index, value) {
    const angle = index * angleStep - Math.PI / 2;
    const r = (Math.min(value, 20) / 20) * maxR;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  }

  const gridLines = [5, 10, 15, 20].map((level) => {
    const points = [];
    for (let i = 0; i < count; i++) {
      const p = polarToXY(i, level);
      points.push(`${p.x},${p.y}`);
    }
    return `<polygon points="${points.join(" ")}" class="radar-grid"/>`;
  }).join("");

  const axes = lenses.map((lens, i) => {
    const p = polarToXY(i, 20);
    return `<line x1="${cx}" y1="${cy}" x2="${p.x}" y2="${p.y}" class="radar-axis"/>`;
  }).join("");

  const teamPoints = teamAverages.map((val, i) => {
    const p = polarToXY(i, val);
    return `${p.x},${p.y}`;
  }).join(" ");

  const playerPoints = playerScores.map((val, i) => {
    const p = polarToXY(i, val);
    return `${p.x},${p.y}`;
  }).join(" ");

  const labels = lenses.map((lens, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const labelR = maxR + 22;
    const lx = cx + labelR * Math.cos(angle);
    const ly = cy + labelR * Math.sin(angle);
    let anchor = "middle";
    if (Math.cos(angle) > 0.3) anchor = "start";
    if (Math.cos(angle) < -0.3) anchor = "end";
    const shortLabel = lens.label.length > 14 ? lens.label.substring(0, 12) + "…" : lens.label;
    return `<text x="${lx}" y="${ly}" text-anchor="${anchor}" dominant-baseline="central" class="radar-label">${escapeHtml(shortLabel)}</text>`;
  }).join("");

  return `
    <svg viewBox="0 0 280 280" class="radar-svg">
      ${gridLines}
      ${axes}
      <polygon points="${teamPoints}" class="radar-team-poly"/>
      <polygon points="${playerPoints}" class="radar-player-poly"/>
      ${playerScores.map((val, i) => {
        const p = polarToXY(i, val);
        return `<circle cx="${p.x}" cy="${p.y}" r="3" class="radar-player-dot"/>`;
      }).join("")}
      ${labels}
    </svg>
  `;
}

function deletePlayer(playerName) {
  state.players = state.players.filter((p) => p.Name !== playerName);
  savePlayers();
  ensureSelectedPlayer();
  render();
  setStatus(`Removed ${playerName} from the squad.`, "good");
}

function analyzeLens(lens) {
  const eligiblePlayers = state.players.filter((player) => isEligibleForLens(player, lens));
  let ranked = eligiblePlayers
    .map((player) => {
      const scoreData = scorePlayerForLens(player, lens);
      return {
        ...player,
        lensScore: scoreData.lensScore,
        rawLensScore: scoreData.rawLensScore,
        gateAverage: scoreData.gateAverage,
        layerScores: scoreData.layerScores,
        relevantAttributes: getRelevantAttributes(lens).map((attribute) => ({
          ...attribute,
          value: player[attribute.name]
        }))
      };
    })
    .sort((left, right) => right.lensScore - left.lensScore || left.Name.localeCompare(right.Name));
  ranked = ranked.map((player, index) => ({ ...player, band: getRelativeBand(index, ranked.length) }));

  const attributeAverages = {};
  const attributeLeaders = {};
  for (const attribute of getRelevantAttributes(lens)) {
    const sortedByAttribute = ranked
      .slice()
      .sort((left, right) => (right[attribute.name] || 0) - (left[attribute.name] || 0));
    attributeAverages[attribute.name] = average(ranked.map((player) => player[attribute.name]));
    attributeLeaders[attribute.name] = sortedByAttribute[0] || null;
  }

  const sortedAttributeAverages = Object.entries(attributeAverages)
    .map(([name, averageValue]) => ({ name, average: averageValue }))
    .sort((left, right) => right.average - left.average);

  return {
    ranked,
    teamAverage: average(ranked.map((player) => player.lensScore)),
    carryAttribute: sortedAttributeAverages[0] || null,
    limitingAttribute: sortedAttributeAverages.at(-1) || null,
    attributeAverages,
    attributeLeaders
  };
}

function scorePlayerForLens(player, lens) {
  const coreScore = weightedAverage(player, lens.core);
  const supportScore = weightedAverage(player, lens.support);
  const accentScore = weightedAverage(player, lens.accent);
  const rawLensScore =
    coreScore * state.lensConfig.scoreModel.coreWeight +
    supportScore * state.lensConfig.scoreModel.supportWeight +
    accentScore * state.lensConfig.scoreModel.accentWeight;

  const gateAverage = average(lens.gateAttributes.map((attribute) => player[attribute]));
  let cappedScore = rawLensScore;
  for (const cap of state.lensConfig.scoreModel.gateCaps) {
    if (gateAverage < cap.ifGateAverageBelow) {
      cappedScore = Math.min(cappedScore, cap.scoreMax);
    }
  }

  return {
    rawLensScore: round1(rawLensScore),
    lensScore: round1(cappedScore),
    gateAverage: round1(gateAverage),
    layerScores: {
      core: round1(coreScore),
      support: round1(supportScore),
      accent: round1(accentScore)
    }
  };
}

function buildLensSummary(lens, analysis) {
  const best = analysis.ranked[0];
  const third = analysis.ranked[2];
  const last = analysis.ranked[analysis.ranked.length - 1];
  if (!best || !last) return "Load a squad to see the full picture for this match situation.";

  const spread = best.lensScore - last.lensScore;
  if (lens.id === "no6_profile") {
    if (third && best.lensScore - third.lensScore <= 1.2) {
      return "More than one player can carry the No. 6 role, so the structure is not dependent on one anchor.";
    }
    if (analysis.ranked[1] && best.lensScore - analysis.ranked[1].lensScore >= 1.4) {
      return `${best.Name} is clearly the strongest No. 6 profile, with a visible drop after the first option.`;
    }
    return "There is one leading anchor profile, but at least one secondary option stays within touch of the top score.";
  }

  if (spread <= 1.6) return "This situation is spread fairly evenly across the squad, so the gap from top to bottom is modest.";
  if (spread <= 3.5) return "There is a clear upper layer for this situation, but the middle of the squad can still support it.";
  return "This situation depends on a few leading profiles, with a real drop after them.";
}

function buildInsights(lens, analysis) {
  const best = analysis.ranked[0];
  const weakest = analysis.ranked[analysis.ranked.length - 1];
  const second = analysis.ranked[1];
  const third = analysis.ranked[2];

  const insightA = best
    ? `${best.Name} leads this situation at ${formatScore(best.lensScore)}. ${second ? `${second.Name}` : "The next option"}${third ? ` and ${third.Name}` : ""} form the next level in the squad.`
    : "No outfield players are currently available for this match situation.";

  const insightB =
    analysis.carryAttribute && analysis.limitingAttribute
      ? `${analysis.carryAttribute.name} is the main strength in this situation, while ${analysis.limitingAttribute.name} is the main weakness.`
      : "Attribute averages will appear once squad data is loaded.";

  const spread = best && weakest ? best.lensScore - weakest.lensScore : 0;
  let insightC = `${buildLensSummary(lens, analysis)}`;
  if (best && weakest) {
    insightC += ` The score gap from ${best.Name} to ${weakest.Name} is ${formatScore(spread)}.`;
  }

  return [insightA, insightB, insightC];
}

function buildPlayerRead(lens, player) {
  const top = player.relevantAttributes.slice().sort((left, right) => right.value - left.value).slice(0, 2);
  const bottom = player.relevantAttributes.slice().sort((left, right) => left.value - right.value).slice(0, 2);
  const topText = top.map((item) => item.name).join(" and ");
  const bottomText = bottom.map((item) => item.name).join(" and ");

  if (player.lensScore >= state.lensConfig.scoreModel.bands.strongFit) {
    return `${player.Name} has one of the strongest profiles for ${lens.label}, driven mainly by ${topText}. The main weaknesses in this situation are ${bottomText}.`;
  }
  if (player.lensScore >= state.lensConfig.scoreModel.bands.goodFit) {
    return `${player.Name} can support ${lens.label} well enough to be trusted here, especially through ${topText}. The profile is held back mostly by ${bottomText}.`;
  }
  if (player.lensScore >= state.lensConfig.scoreModel.bands.workingOption) {
    return `${player.Name} is a usable option for ${lens.label}. ${topText} help the profile, but ${bottomText} stop it from looking complete.`;
  }
  return `${player.Name} is a weak fit for ${lens.label} right now. ${topText} offer some support, but ${bottomText} leave the profile short in key areas.`;
}

function formatPlayerMeta(player) {
  const position = player.Position || "No position listed";
  const age = player.Age ? `${player.Age}` : "Age -";
  return `${position} - ${age}`;
}

function getAttributeShortLabel(attributeName) {
  return ATTRIBUTE_SHORT_LABELS[attributeName] || attributeName;
}

function getRelevantAttributes(lens) {
  const attributes = [];
  for (const [name, weight] of Object.entries(lens.core || {})) attributes.push({ name, weight, tier: "core" });
  for (const [name, weight] of Object.entries(lens.support || {})) attributes.push({ name, weight, tier: "support" });
  for (const [name, weight] of Object.entries(lens.accent || {})) attributes.push({ name, weight, tier: "accent" });
  return attributes;
}

function getActiveLens() {
  return state.lensConfig.lenses.find((lens) => lens.id === state.activeLensId) || state.lensConfig.lenses[0];
}

function focusDetailView() {
  scrollToSection(els.detailSection);
}

function scrollSelectedPlayerIntoView() {
  if (window.innerWidth <= 980) {
    scrollToSection(els.sideColumn);
  }
}

function scrollToSection(element) {
  element?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function ensureSelectedPlayer() {
  const lens = getActiveLens();
  if (!lens) return;
  const analysis = analyzeLens(lens);
  const filtered = filterRankedPlayers(analysis.ranked);
  const targetPool = filtered.length ? filtered : analysis.ranked;
  if (!targetPool.length) {
    state.selectedPlayerName = null;
    return;
  }

  const stillPresent = targetPool.some((player) => player.Name === state.selectedPlayerName);
  if (!stillPresent) {
    state.selectedPlayerName = targetPool[0].Name;
  }
}

function filterRankedPlayers(players) {
  let filtered = players;
  if (state.positionFilter && state.positionFilter !== "all") {
    const posKey = state.positionFilter.toUpperCase();
    filtered = filtered.filter((player) => {
      const pos = String(player.Position || "").toUpperCase();
      return pos.includes(posKey);
    });
  }
  if (state.query) {
    const query = state.query.toLowerCase();
    filtered = filtered.filter((player) => `${player.Name} ${player.Position || ""}`.toLowerCase().includes(query));
  }
  return filtered;
}

function isEligibleForLens(player, lens) {
  if (!state.lensConfig?.principles?.excludeGoalkeepersFromOutfieldLenses) return true;
  if (lens.id === "no6_profile") return !isGoalkeeper(player);
  return !isGoalkeeper(player);
}

function isGoalkeeper(player) {
  const position = String(player.Position || "").toUpperCase();
  return position.includes("GK") || position.includes("GOALKEEPER");
}

function weightedAverage(player, weights) {
  const entries = Object.entries(weights || {});
  if (!entries.length) return 0;
  let total = 0;
  let sum = 0;
  for (const [attribute, weight] of entries) {
    total += (player[attribute] || 0) * weight;
    sum += weight;
  }
  return sum ? total / sum : 0;
}

function getRelativeBand(index, total) {
  if (total <= 1) return { label: "Lead profile", className: "band-strong" };
  const ratio = index / Math.max(1, total - 1);
  if (ratio <= 0.2) return { label: "Lead profile", className: "band-strong" };
  if (ratio <= 0.5) return { label: "Strong profile", className: "band-good" };
  if (ratio <= 0.8) return { label: "Usable profile", className: "band-working" };
  return { label: "Weak fit", className: "band-risk" };
}

function average(values) {
  const clean = values.filter((value) => Number.isFinite(value));
  if (!clean.length) return 0;
  return clean.reduce((sum, value) => sum + value, 0) / clean.length;
}

function round1(value) {
  return Math.round((Number(value) || 0) * 10) / 10;
}

function formatScore(value) {
  return Number.isFinite(value) ? value.toFixed(1) : "-";
}

function formatAttributeValue(value) {
  return Number.isFinite(value) ? String(Math.round(value)) : "-";
}

function valueClass(value) {
  if (!Number.isFinite(value)) return "value-empty";
  if (value >= 16) return "value-elite";
  if (value >= 13) return "value-strong";
  if (value >= 10) return "value-ok";
  return "value-weak";
}

function renderLayerRow(label, value, fillClass) {
  return `
    <div class="layer-row">
      <span>${escapeHtml(label)}</span>
      <div class="layer-bar"><div class="layer-fill ${fillClass}" style="width:${Math.max(0, Math.min(100, (value / 20) * 100))}%"></div></div>
      <span>${formatScore(value)}</span>
    </div>
  `;
}

function setStatus(message, tone = "neutral") {
  els.statusMessage.className = `status-pill status-${tone}`;
  els.statusMessage.textContent = message;
}

function normalizePlayer(raw) {
  const player = {
    Name: String(raw.Name || "").trim(),
    Position: String(raw.Position || "").trim(),
    Age: normalizeAge(raw.Age)
  };
  for (const attribute of ALL_ATTRIBUTES) {
    player[attribute] = clampAttribute(raw[attribute]);
  }
  return player;
}

function normalizeAge(value) {
  const age = Number(value);
  return Number.isFinite(age) && age > 0 ? age : null;
}

function clampAttribute(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.max(0, Math.min(20, Math.round(number)));
}

function savePlayers() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.players));
}

function loadSavedPlayers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizePlayer).filter((player) => player.Name);
  } catch (error) {
    console.error(error);
    return [];
  }
}

function exportCurrentSquad() {
  if (!state.players.length) {
    setStatus("No squad loaded yet.", "neutral");
    return;
  }
  const headers = ["Name", "Position", "Age", ...ALL_ATTRIBUTES];
  const rows = state.players.map((player) =>
    headers.map((header) => {
      const value = player[header];
      if (value === null || value === undefined) return "";
      return String(value).includes(",") ? `"${String(value).replace(/"/g, '""')}"` : String(value);
    })
  );
  const csvText = [headers.join(","), ...rows.map((row) => row.join(","))].join("\r\n");
  const blob = new Blob([csvText], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "fm26_squad_analysis_export.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  setStatus("Downloaded current squad.", "good");
}

function parseSquadCsv(text) {
  const delimiter = detectDelimiter(text);
  const rows = parseDelimited(text, delimiter);
  if (rows.length < 2) return [];

  const headers = rows[0].map((header) => String(header || "").trim());
  const headerIndex = new Map(headers.map((header, index) => [canonical(header), index]));

  const players = rows
    .slice(1)
    .filter((row) => row.some((cell) => String(cell || "").trim()))
    .map((row) => {
      const player = {
        Name: lookupField(row, headerIndex, ["name", "player", "navn"]),
        Position: lookupField(row, headerIndex, ["position", "bestpos", "bestposition", "pos", "posisjon"]),
        Age: lookupField(row, headerIndex, ["age", "alder"])
      };

      for (const attribute of ALL_ATTRIBUTES) {
        player[attribute] = lookupField(row, headerIndex, [canonical(attribute)]);
      }

      return normalizePlayer(player);
    })
    .filter((player) => player.Name);

  return players;
}

function lookupField(row, headerIndex, aliases) {
  for (const alias of aliases) {
    const index = headerIndex.get(alias);
    if (index !== undefined) return row[index];
  }
  return "";
}

function detectDelimiter(text) {
  const sampleLine = String(text || "")
    .split(/\r?\n/)
    .find((line) => line.trim().length);
  if (!sampleLine) return ",";
  const scores = [
    { delimiter: ",", count: countChar(sampleLine, ",") },
    { delimiter: ";", count: countChar(sampleLine, ";") },
    { delimiter: "\t", count: countChar(sampleLine, "\t") }
  ].sort((left, right) => right.count - left.count);
  return scores[0].count > 0 ? scores[0].delimiter : ",";
}

function countChar(text, char) {
  return text.split(char).length - 1;
}

function parseDelimited(text, delimiter) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        field += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && char === delimiter) {
      row.push(field);
      field = "";
      continue;
    }

    if (!inQuotes && (char === "\n" || char === "\r")) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      continue;
    }

    field += char;
  }

  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

function canonical(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function slug(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (match) => {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[match];
  });
}

async function fetchJson(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Could not fetch ${path}`);
  return response.json();
}

async function fetchText(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Could not fetch ${path}`);
  return response.text();
}
