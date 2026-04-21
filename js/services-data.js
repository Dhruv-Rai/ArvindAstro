/* ═══════════════════════════════════════════════════════════
   Arvind Rai — Services Data Model
   Single source of truth for homepage tabs, listing, and detail page.
   ═══════════════════════════════════════════════════════════ */

(function () {
  var SERVICE_CATEGORIES = [
    { key: 'all', label: 'All' },
    { key: 'consultations', label: 'Consultations' },
    { key: 'vastu', label: 'Vastu' },
    { key: 'puja-remedies', label: 'Puja & Remedies' },
    { key: 'kundli', label: 'Kundli' },
    { key: 'reports', label: 'Reports' }
  ];

  var SERVICE_HOME_CATEGORY_LIMITS = {
    consultations: 4,
    vastu: 4,
    kundli: 3,
    reports: 4,
    'puja-remedies': 4
  };

  // Fixed 8-card preview for the "All" tab.
  // Includes two puja category cards via "puja-category:<slug>" tokens.
  var SERVICE_HOME_ALL_PREVIEW = [
    'kundali-horoscope-analysis',
    'kundali-milan-match-making',
    'home-vastu-analysis',
    'industrial-corporate-vastu',
    'vargiya-16-kundli',
    'Year Prediction Report',
    'puja-category:planetary',
    'puja-category:wealth-career'
  ];

  var pujaCategories = [
    {
      title: 'Planetary Favor',
      slug: 'planetary',
      count: 12,
      icon: '🪐',
      description: 'Balance challenging graha influences and reduce recurring blocks through focused ritual remedies.',
      heroDescription: 'Category focused on planetary alignment, dosha balancing, and timing support for major life decisions.',
      intro: {
        solves: [
          'Recurring delays, instability, and astrological pressure periods.',
          'Planet-specific imbalances indicated in consultation or chart review.',
          'Negative cycles affecting confidence, progress, and peace.'
        ],
        when: 'Choose this category when graha imbalance, dasha-related stress, or repeated outcomes point to planetary pacification needs.',
        who: 'Recommended for individuals and families seeking structured spiritual support during difficult planetary phases.'
      }
    },
    {
      title: 'Wealth & Career',
      slug: 'wealth-career',
      count: 4,
      icon: '💼',
      description: 'Pujas for stable financial flow, business momentum, and professional growth with fewer obstacles.',
      heroDescription: 'Category dedicated to career elevation, wealth stability, and timely opportunities in business and profession.',
      intro: {
        solves: [
          'Career stagnation, delayed opportunities, and repeated setbacks.',
          'Business slowdowns, uncertain growth, and cash-flow concerns.',
          'Lack of clarity in professional direction and role transitions.'
        ],
        when: 'Best selected during role changes, business expansion, or prolonged phases of financial and professional unpredictability.',
        who: 'Suitable for professionals, business owners, and families prioritizing career progress with spiritual reinforcement.'
      }
    },
    {
      title: 'Health & Wellness',
      slug: 'health',
      count: 3,
      icon: '🕯️',
      description: 'Ritual support for resilience, protection, recovery strength, and emotional steadiness during vulnerable periods.',
      heroDescription: 'Category centered on healing-focused pujas for inner stability, protection, and long-term wellbeing support.',
      intro: {
        solves: [
          'Health anxiety, prolonged stress, and low vitality phases.',
          'Need for spiritual reinforcement during recovery windows.',
          'Emotional heaviness affecting daily discipline and focus.'
        ],
        when: 'Choose this category during health-sensitive periods, preventive wellness planning, or when sustained energy support is needed.',
        who: 'For individuals or families seeking dharmic, healing-oriented practices alongside practical care.'
      }
    },
    {
      title: 'Happiness & Prosperity',
      slug: 'prosperity',
      count: 4,
      icon: '🪔',
      description: 'Pujas designed to improve home harmony, emotional balance, and auspicious prosperity conditions.',
      heroDescription: 'Category aimed at building sustained positivity, family harmony, and balanced prosperity in daily life.',
      intro: {
        solves: [
          'Household tension, low positivity, and recurring emotional strain.',
          'Lack of consistency in prosperity and peace at home.',
          'Need for family-centered spiritual strengthening.'
        ],
        when: 'Prefer this category when home atmosphere, family momentum, and prosperity outlook require upliftment and continuity.',
        who: 'Ideal for householders and family leaders focused on stability, joy, and protective positivity.'
      }
    },
    {
      title: 'Love & Harmony',
      slug: 'love',
      count: 4,
      icon: '💞',
      description: 'Relationship-focused pujas for trust, communication, marriage harmony, and emotional alignment.',
      heroDescription: 'Category dedicated to relational balance, marriage support, and stronger emotional understanding.',
      intro: {
        solves: [
          'Communication breakdowns and recurring relationship friction.',
          'Marriage delays or instability in commitments.',
          'Emotional distance reducing peace and trust.'
        ],
        when: 'Select this category during relationship transition phases, marriage planning, or ongoing emotional disconnect.',
        who: 'For couples, families, and individuals seeking respectful harmony and stable relational momentum.'
      }
    },
    {
      title: 'Education & Global Wellness',
      slug: 'education',
      count: 5,
      icon: '📘',
      description: 'Pujas supporting learning focus, exam confidence, global opportunities, and disciplined growth.',
      heroDescription: 'Category for education milestones, overseas pathways, and focused intellectual progress.',
      intro: {
        solves: [
          'Low concentration, academic stress, and exam pressure.',
          'Delays in admissions, travel approvals, and global transitions.',
          'Need for clarity in educational and international goals.'
        ],
        when: 'Choose this category during admissions, exam cycles, higher-study planning, and global mobility phases.',
        who: 'Suitable for students, parents, and professionals preparing for education-led growth and international outcomes.'
      }
    },
    {
      title: 'Very Special Pujans',
      slug: 'special',
      count: 3,
      icon: '🔱',
      description: 'High-intensity spiritual pujans for specific sankalps requiring focused ritual depth and discipline.',
      heroDescription: 'Category for advanced or special-purpose pujans with deeper ritual structure and sankalp focus.',
      intro: {
        solves: [
          'Special spiritual needs requiring targeted ritual intensity.',
          'Complex life phases where standard remedies feel insufficient.',
          'Sankalps demanding advanced guidance and execution.'
        ],
        when: 'Select this category only after guidance confirms the need for special-purpose ritual paths.',
        who: 'Recommended for those seeking deeper, sankalp-specific ritual support under proper direction.'
      }
    },
    {
      title: 'Legal & Conflicts',
      slug: 'legal',
      count: 2,
      icon: '⚖️',
      description: 'Conflict-resolution pujas for legal stress, opposition pressure, and strategic calm during disputes.',
      heroDescription: 'Category focused on legal challenges, adversarial pressure, and protection during conflict-heavy periods.',
      intro: {
        solves: [
          'Long legal battles, adversarial pressure, and uncertainty.',
          'Escalating personal or professional conflicts.',
          'Mental unrest during extended dispute timelines.'
        ],
        when: 'Choose this category when legal complexity, conflict fatigue, or hostile environments require spiritual reinforcement.',
        who: 'Useful for individuals, families, and business stakeholders facing prolonged legal or conflict situations.'
      }
    }
  ];

  var pujas = [
    { slug: 'navagraha-shanti-pujan', name: 'नवग्रह शांति पूजन', category: 'planetary', price: 51000, description: 'For balancing all planetary influences and reducing repeated instability.' },
    { slug: 'graha-shanti-anushthan', name: 'नक्षत्र शांति पूजन', category: 'planetary', price: 15000, description: 'For targeted graha balancing based on individual chart indications.' },
    { slug: 'shani-shanti-pujan', name: 'सूर्य ग्रह शांति', category: 'planetary', price: 9000, description: 'For Saturn-related delays, pressure cycles, and karmic correction support.' },
    { slug: 'mangal-dosh-nivaran', name: 'चंद्र ग्रहण शांति', category: 'planetary', price: 10000, description: 'For reducing Mars dosha intensity and relationship conflict tendencies.' },
    { slug: 'rahu-ketu-shanti-pujan', name: 'मंगल ग्रह शांति', category: 'planetary', price: 10000, description: 'For confusion phases, sudden disruptions, and karmic node balancing.' },
    { slug: 'surya-aditya-havan', name: 'बुध ग्रह शांति', category: 'planetary', price: 9000, description: 'For confidence, authority support, and vitality-centered alignment.' },
    { slug: 'chandra-shanti-pujan', name: 'गुरु ग्रह शांति', category: 'planetary', price: 15000, description: 'For emotional steadiness, mental peace, and calm decision-making.' },
    { slug: 'guru-brihaspati-pujan', name: 'शुक्र ग्रह शांति', category: 'planetary', price: 15000, description: 'For wisdom, guidance, and supportive timing for growth paths.' },
    { slug: 'budh-graha-shanti', name: 'शनि ग्रह शांति', category: 'planetary', price: 18000, description: 'For communication clarity, analytical strength, and learning flow.' },
    { slug: 'kaal-sarp-dosh-nivaran', name: 'राहु ग्रह शांति', category: 'planetary', price: 15000, description: 'For balancing effects linked with Kaal Sarp configurations.' },
    { slug: 'pitra-dosh-nivaran', name: 'केतु ग्रह शांति', category: 'planetary', price: 15000, description: 'For ancestral karmic balancing and family-level peace support.' },

    { slug: 'lakshmi-kuber-pujan', name: 'व्यापार वृद्धि पूजन', category: 'wealth-career', price: 11000, description: 'For financial flow, business stability, and wealth discipline.' },
    { slug: 'sarva-karya-siddhi-pujan', name: 'ऋणमुक्त पूजा', category: 'wealth-career', price: 12500, description: 'For career obstacles, delayed tasks, and execution momentum.' },
    { slug: 'vyapar-vriddhi-pujan', name: 'पदोन्नति कारक पूजन', category: 'wealth-career', price: 11000, description: 'For business growth, customer flow, and strategic expansion.' },
    { slug: 'career-uday-pujan', name: 'यश/वजय प्राप्ति पूजन ', category: 'wealth-career', price: 21000, description: 'For role transitions, recognition, and timely professional upliftment.' },

    { slug: 'maha-mrityunjaya-anushthan', name: 'महामृयु ंजय जप पूजन ', category: 'health', price: 151000, description: 'For healing strength, spiritual protection, and resilience support.' },
    { slug: 'dhanvantari-pujan', name: 'त्रिपिंडी श्राद्ध', category: 'health', price: 25000, description: 'For wellness-focused spiritual reinforcement and recovery steadiness.' },
    { slug: 'rog-nivaran-havan', name: 'मृत संजीवनी यज्ञ', category: 'health', price: 251000, description: 'For reducing health stress patterns and restoring inner stability.' },

    { slug: 'durga-saptashati-anushthan', name: '1100 आवृत्ति हनुमान चालीसा पाठ एवं हवन', category: 'prosperity', price: 5100, description: 'For courage, protection, and sustained positive household energy.' },
    { slug: 'griha-shanti-pujan', name: 'सत्यनारायण कथा पूजन', category: 'prosperity', price: 5100, description: 'For home harmony, reduced tension, and auspicious living conditions.' },
    { slug: 'santan-sukh-pujan', name: 'पुत्र कामेष्टि यज्ञ', category: 'prosperity', price: 125000, description: 'For family peace, child-related wellbeing, and emotional support.' },
    
    { slug: 'vivah-sukh-pujan', name: 'मांगलिक दोष निवारण पूजन', category: 'love', price: 2500, description: 'For marriage harmony, commitment stability, and emotional trust.' },
    { slug: 'dampatya-samanvay-pujan', name: 'रुद्राभिषेक पूजन', category: 'love', price: 5100, description: 'For improving understanding and reducing recurring couple conflicts.' },
    { slug: 'prem-samvad-pujan', name: 'पार्थिव शिवलिंग पूजन', category: 'love', price: 11000, description: 'For communication softness, empathy, and relational clarity.' },
    { slug: 'mangalya-raksha-pujan', name: 'कात्यायनी पूजन', category: 'love', price: 25000, description: 'For safeguarding relationship stability and shared emotional peace.' },

    { slug: 'saraswati-pujan', name: 'सरस्वती पूजन', category: 'education', price: 11000, description: 'For concentration, academic clarity, and disciplined study flow.' },
    { slug: 'vidya-siddhi-havan', name: 'शिक्षा बाधा निवारण पूजा', category: 'education', price: 5100, description: 'For exam confidence, retention strength, and focused preparation.' },
    { slug: 'overseas-success-pujan', name: 'बुद्धिवर्धक पूजन', category: 'education', price: 5100, description: 'For smooth movement in overseas study and migration pathways.' },
    { slug: 'global-career-blessing-pujan', name: 'शांत पाठ', category: 'education', price: 2100, description: 'For international career growth, visibility, and transition support.' },
    { slug: 'child-focus-pujan', name: 'सुंदरकांड पाठ', category: 'education', price: 2100, description: 'For student focus, routine discipline, and balanced learning behavior.' },

    { slug: 'baglamukhi-anushthan', name: 'शतचंडी पाठ एवं अनुष्ठान ', category: 'special', price: 551000, description: 'For intense opposition control and high-stakes stability support.' },
    { slug: 'shiv-rudrabhishek', name: 'रूद्र चंडी पाठ एवं अनुष्ठान', category: 'special', price: 1100000, description: 'For deep peace, purification, and elevated spiritual protection.' },
    { slug: 'mahalakshmi-mahayagya', name: 'सहस्रचंडी पूजन और अनुष्ठान', category: 'special', price: 110000, description: 'For advanced prosperity sankalp and ritual-depth manifestation support.' },
    { slug: 'lakshachandi-path-anushthan', name: 'लक्षचंडी पाठ एवं अनुष्ठान', category: 'special', price: 2500000, description: 'For deep peace, purification, and elevated spiritual protection.' },

    { slug: 'court-case-vijay-pujan', name: 'बगलामुखी महाअनुष्ठान', category: 'legal', price: 225000, description: 'For legal strength, clarity, and sustained confidence in disputes.' },
    { slug: 'shatru-nivaran-anushthan', name: 'गजेंद्र मोक्ष पूजन', category: 'legal', price: 11000, description: 'For conflict neutralization and protection during adversarial phases.' }
  ];

  var SERVICES_DATA = [
    {
      slug: 'kundali-horoscope-analysis',
      category: 'consultations',
      title: 'Kundali / Horoscope Analysis',
      icon: '🌟',
      badge: 'Popular',
      priceText: '₹ 2,500',
      cardDescription: 'Detailed chart consultation for career, marriage, health and key life timings.',
      heroDescription: 'A complete consultation to decode your chart, planetary strengths, and upcoming periods with practical guidance.',
      mode: 'Online / In Person',
      bookingService: 'Janam Kundali'
    },
    {
      slug: 'kundali-milan-match-making',
      category: 'consultations',
      title: 'Kundali Milan / Match Making',
      icon: '💑',
      badge: 'Trusted',
      priceText: '₹ 2,100',
      cardDescription: 'Compatibility consultation with guna milan, mangal check and long-term match outlook.',
      heroDescription: 'An in-depth compatibility review for marriage decisions with practical remedies for dosha concerns.',
      mode: 'Online',
      bookingService: 'Kundali Milan'
    },
    {
      slug: 'prashna-kundali',
      category: 'consultations',
      title: 'Prashna Kundali',
      icon: '🕉️',
      badge: 'Focused',
      priceText: '₹ 1,100',
      cardDescription: 'Question-based astrology reading for immediate concerns and decision clarity.',
      heroDescription: 'Best suited when birth details are unclear and you need direct answers for a specific question.',
      mode: 'Online / Phone',
      bookingService: 'Janam Kundali'
    },
    {
      slug: 'birth-time-rectification',
      category: 'consultations',
      title: 'Birth Time Rectification',
      icon: '⏰',
      badge: 'Expert',
      priceText: '₹ 1,500',
      cardDescription: 'Rectify approximate birth time through event mapping and planetary validation.',
      heroDescription: 'Helps improve prediction accuracy by reconstructing a reliable birth time from life milestones.',
      mode: 'Online',
      bookingService: 'Janam Kundali'
    },

    {
      slug: 'home-vastu-analysis',
      category: 'vastu',
      title: 'Home Vastu Analysis',
      icon: '🏠',
      badge: 'Residential',
      priceText: '₹ 51,000',
      cardDescription: 'Complete home vastu consultation with practical and non-demolition remedies.',
      heroDescription: 'Detailed vastu assessment for every zone of your home to improve harmony, health and prosperity.',
      duration: 'Site Visit',
      mode: 'In Person',
      bookingService: 'Vastu Shastra'
    },
    {
      slug: 'industrial-corporate-vastu',
      category: 'vastu',
      title: 'Industry / Corporate Vastu',
      icon: '🏭',
      badge: 'Business',
      priceText: '₹ 1,25,000',
      cardDescription: 'Vastu for plants, offices and business spaces to support growth and stability.',
      heroDescription: 'Strategic vastu planning for industrial and corporate environments focused on efficiency and growth.',
      duration: 'Site Visit',
      mode: 'In Person',
      bookingService: 'Industrial / Corporate Vastu'
    },
    {
      slug: 'land-flat-selection-vastu',
      category: 'vastu',
      title: 'Land / Flat Selection Vastu',
      icon: '🧭',
      badge: 'Pre-Purchase',
      priceText: '₹ 11,000',
      cardDescription: 'Direction and layout suitability check before buying plot, flat or property.',
      heroDescription: 'Pre-purchase vastu assessment to avoid structural and directional imbalances before investment.',
      mode: 'Online / In Person',
      bookingService: 'Vastu Shastra'
    },
    {
      slug: 'online-vastu-consultation',
      category: 'vastu',
      title: 'Online Vastu Consultation',
      icon: '💻',
      badge: 'Remote',
      priceText: '₹ 5,100',
      cardDescription: 'Remote vastu guidance using floor plans, videos and direction references.',
      heroDescription: 'Ideal for clients outside Varanasi. Share plans and receive actionable vastu corrections remotely.',
      mode: 'Online',
      bookingService: 'Vastu Shastra'
    },

    {
      slug: 'vargiya-16-kundli',
      category: 'kundli',
      title: '16 Vargiya Kundli',
      icon: '📜',
      badge: 'Advanced',
      priceText: '₹ 21,000',
      cardDescription: 'Advanced divisional chart study for deeper life-area specific analysis.',
      heroDescription: 'High-depth kundli reading using 16 divisional charts for precise prediction insights.',
      mode: 'Online',
      bookingService: 'Janam Kundali'
    },
    {
      slug: 'vargiya-7-kundli',
      category: 'kundli',
      title: '7 Vargiya Kundli',
      icon: '🪐',
      badge: 'Detailed',
      priceText: '₹ 11,000',
      cardDescription: 'Divisional chart analysis across core life dimensions for practical guidance.',
      heroDescription: 'Balanced-depth divisional analysis for career, relationships, health and spiritual progress.',
      duration: '55 mins',
      mode: 'Online / Phone',
      bookingService: 'Janam Kundali'
    },
    {
      slug: 'janmakshar',
      category: 'kundli',
      title: 'Janmakshar',
      icon: '🔯',
      badge: 'Classic',
      priceText: '₹ 5,100',
      cardDescription: 'Traditional janmakshar-based reading for personality and life tendencies.',
      heroDescription: 'Classical chart interpretation in traditional style with practical modern relevance.',
      mode: 'Online',
      bookingService: 'Janam Kundali'
    },

    {
      slug: 'Year Prediction Report',
      category: 'reports',
      title: 'Year Prediction Report',
      icon: '📅',
      badge: 'Yearly',
      priceText: '₹ 5,100',
      cardDescription: 'Month-by-month yearly forecast with key opportunities and caution periods.',
      heroDescription: 'Structured annual report highlighting favorable windows and risk periods across major life areas.',
      duration: '24 hrs Delivery',
      mode: 'PDF Report',
      bookingService: 'Janam Kundali'
    },
    {
      slug: 'marriage-compatibility-report',
      category: 'reports',
      title: 'Marriage Compatibility Report',
      icon: '❤️',
      badge: 'Trusted',
      priceText: '₹ 5,100',
      cardDescription: 'Comprehensive compatibility report with strengths, risks and remedy guidance.',
      heroDescription: 'Useful for engaged or prospective couples seeking deeper compatibility clarity in written format.',
      duration: '24 hrs Delivery',
      mode: 'PDF Report',
      bookingService: 'Kundali Milan'
    },
    {
      slug: 'Gemstone Analysis',
      category: 'reports',
      title: 'Gemstone Analysis',
      icon: '💼',
      badge: 'Most Asked',
      priceText: '₹ 2,500',
      cardDescription: 'Detailed report on profession, growth cycles, job change and wealth potential.',
      heroDescription: 'Career-focused written report with timelines and remedies for stable professional progress.',
      duration: '24 hrs Delivery',
      mode: 'PDF Report',
      bookingService: 'Janam Kundali'
    },
    {
      slug: 'Numerological Report',
      category: 'reports',
      title: 'Numerological Report',
      icon: '🔢',
      badge: 'Insight',
      priceText: '₹ 2,500',
      cardDescription: 'Astrological wellness tendencies, vulnerable periods and supportive remedies.',
      heroDescription: 'Focused report for health-related planetary patterns and preventive spiritual recommendations.',
      duration: '24 hrs Delivery',
      mode: 'PDF Report',
      bookingService: 'Janam Kundali'
    },

    {
      slug: 'sarva-karya-siddhi-pujan',
      category: 'puja-remedies',
      title: 'ऋणमुक्ति पूजन',
      icon: '🙏',
      badge: 'Debt Relief',
      priceText: '₹ 12,500',
      cardDescription: 'Puja for clearing financial blocks, debt stress, and restoring stable cash flow.',
      heroDescription: 'Targeted ritual for resolving recurring financial obligations and restoring momentum in stalled initiatives.',
      duration: 'By Muhurta',
      mode: 'In Person / Temple',
      bookingService: 'Pujan / Remedies'
    },
    {
      slug: 'shiv-rudrabhishek',
      category: 'puja-remedies',
      title: 'Shiv Pujan & Rudrabhishek',
      icon: '🔱',
      badge: 'Most Trusted',
      priceText: '₹ 7,500',
      cardDescription: 'Sacred Shiva ritual for peace, protection and spiritual stability.',
      heroDescription: 'Performed for inner peace, health stability, and planetary pacification through Shiva upasana.',
      duration: 'By Muhurta',
      mode: 'In Person / Temple',
      bookingService: 'Pujan / Remedies'
    },
    {
      slug: 'navagraha-shanti-pujan',
      category: 'puja-remedies',
      title: 'नवग्रह शांति पूजन',
      icon: '⭐',
      badge: 'Planetary',
      priceText: '₹ 51,000',
      cardDescription: 'Harmonize all nine planetary influences through complete Vedic ritual.',
      heroDescription: 'A complete planetary balancing pujan recommended during prolonged struggle periods.',
      duration: 'By Muhurta',
      mode: 'In Person / Temple',
      bookingService: 'Pujan / Remedies'
    },
    {
      slug: 'maha-mrityunjaya-anushthan',
      category: 'puja-remedies',
      title: 'Maha Mrityunjaya Anushthan',
      icon: '🕯️',
      badge: 'Healing',
      priceText: '₹ 15,100',
      cardDescription: 'Powerful healing and protection anushthan for peace and resilience.',
      heroDescription: 'Recommended during health vulnerability or severe stress phases for spiritual support.',
      duration: 'By Muhurta',
      mode: 'In Person / Temple',
      bookingService: 'Pujan / Remedies'
    },
    {
      slug: 'mangal-dosh-nivaran',
      category: 'puja-remedies',
      title: 'Mangal Dosh Nivaran',
      icon: '🔥',
      badge: 'Remedy',
      priceText: 'As per requirement',
      cardDescription: 'Focused remedy ritual for mangal dosh and marriage-related obstacles.',
      heroDescription: 'Tailored ritual process based on chart severity and muhurta suitability.',
      duration: 'By Muhurta',
      mode: 'In Person',
      bookingService: 'Pujan / Remedies'
    },
    {
      slug: 'kaal-sarp-dosh-nivaran',
      category: 'puja-remedies',
      title: 'Kaal Sarp Dosh Nivaran',
      icon: '🐍',
      badge: 'Ritual',
      priceText: 'As per requirement',
      cardDescription: 'Traditional process for balancing effects associated with kaal sarp yoga.',
      heroDescription: 'Recommended only after chart confirmation and proper muhurta guidance.',
      duration: 'By Muhurta',
      mode: 'In Person',
      bookingService: 'Pujan / Remedies'
    },
    {
      slug: 'durga-saptashati-anushthan',
      category: 'puja-remedies',
      title: 'Durga Saptashati Anushthan',
      icon: '🪔',
      badge: 'Shakti',
      priceText: 'As per requirement',
      cardDescription: 'Shakti sadhana for courage, protection and removal of recurring negativity.',
      heroDescription: 'A structured anushthan performed with sankalp for family and personal wellbeing.',
      duration: 'By Muhurta',
      mode: 'In Person / Temple',
      bookingService: 'Pujan / Remedies'
    },
    {
      slug: 'lakshmi-kuber-pujan',
      category: 'puja-remedies',
      title: 'व्यापार वृद्धि पूजन',
      icon: '💰',
      badge: 'Business Growth',
      priceText: '₹ 11,000',
      cardDescription: 'Puja for business growth, financial flow, and sustained wealth momentum.',
      heroDescription: 'Ideal during business expansion, stagnant revenue cycles, or when seeking stable financial momentum with spiritual support.',
      duration: 'By Muhurta',
      mode: 'In Person / Temple',
      bookingService: 'Pujan / Remedies'
    },
    {
      slug: 'pitra-dosh-nivaran',
      category: 'puja-remedies',
      title: 'Pitra Dosh Nivaran',
      icon: '🕊️',
      badge: 'Ancestral',
      priceText: 'As per requirement',
      cardDescription: 'Traditional process for ancestral peace and family karmic balance.',
      heroDescription: 'Performed with proper ritual protocol after consultation and chart review.',
      duration: 'By Muhurta',
      mode: 'In Person',
      bookingService: 'Pujan / Remedies'
    },
    {
      slug: 'nakshatra-shanti-pujan',
      category: 'puja-remedies',
      title: 'नक्षत्र शांति पूजन',
      icon: '🛕',
      badge: 'Custom',
      priceText: '₹ 15,000',
      cardDescription: 'Customized planetary peace ritual based on individual kundli needs.',
      heroDescription: 'Designed after detailed consultation for targeted graha balancing.',
      duration: 'By Muhurta',
      mode: 'In Person / Temple',
      bookingService: 'Pujan / Remedies'
    }
  ];

  function normalizeSlug(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function syncPujaCategoryCounts() {
    var countsByCategory = {};
    var i;

    for (i = 0; i < pujas.length; i++) {
      var categoryKey = normalizeSlug(pujas[i].category);
      countsByCategory[categoryKey] = (countsByCategory[categoryKey] || 0) + 1;
    }

    for (i = 0; i < pujaCategories.length; i++) {
      var category = pujaCategories[i];
      category.count = countsByCategory[normalizeSlug(category.slug)] || 0;
    }
  }

  function formatRupee(value) {
    if (value === null || value === undefined || value === '') {
      return 'As per requirement';
    }

    var numeric = Number(value);
    if (isNaN(numeric)) {
      return String(value);
    }

    return '₹ ' + numeric.toLocaleString('en-IN');
  }

  function getPujaCategoryMeta(categorySlug) {
    for (var i = 0; i < pujaCategories.length; i++) {
      if (pujaCategories[i].slug === categorySlug) {
        return pujaCategories[i];
      }
    }
    return null;
  }

  function getPujaCategoryBadge(categorySlug) {
    var badgeMap = {
      planetary: 'Planetary',
      'wealth-career': 'Career',
      health: 'Healing',
      prosperity: 'Prosperity',
      love: 'Harmony',
      education: 'Education',
      special: 'Special',
      legal: 'Legal'
    };

    return badgeMap[categorySlug] || 'Remedy';
  }

  function getPujaCategoryIcon(categorySlug) {
    var categoryMeta = getPujaCategoryMeta(categorySlug);
    if (categoryMeta && categoryMeta.icon) {
      return categoryMeta.icon;
    }
    return '🪔';
  }

  function buildPujaServiceItem(puja) {
    var categoryMeta = getPujaCategoryMeta(puja.category);
    return {
      slug: puja.slug,
      category: 'puja-remedies',
      type: 'puja',
      pujaCategory: puja.category,
      title: puja.name,
      icon: getPujaCategoryIcon(puja.category),
      badge: getPujaCategoryBadge(puja.category),
      priceText: formatRupee(puja.price),
      cardDescription: puja.description,
      heroDescription:
        puja.heroDescription ||
        (puja.description + ' Performed according to muhurta and sankalp guidelines.'),
      duration: 'By Muhurta',
      mode: 'In Person / Temple',
      bookingService: 'Pujan / Remedies',
      pujaCategoryTitle: categoryMeta ? categoryMeta.title : 'Puja & Remedies'
    };
  }

  function syncPujaServicesCatalog() {
    var existingBySlug = {};
    var pujaBySlug = {};
    var i;

    for (i = 0; i < pujas.length; i++) {
      pujaBySlug[normalizeSlug(pujas[i].slug)] = pujas[i];
    }

    for (i = 0; i < SERVICES_DATA.length; i++) {
      var existingItem = SERVICES_DATA[i];
      var existingSlug = normalizeSlug(existingItem.slug);
      existingBySlug[existingSlug] = existingItem;

      if (existingItem.category !== 'puja-remedies') {
        continue;
      }

      var pujaMatch = pujaBySlug[existingSlug];
      if (!pujaMatch) {
        continue;
      }

      var normalizedPujaService = buildPujaServiceItem(pujaMatch);

      // Sync puja classification metadata — but preserve the English display title
      // and copy already written descriptions from SERVICES_DATA to avoid Hindi overwrite.
      existingItem.category = normalizedPujaService.category;
      existingItem.pujaCategory = normalizedPujaService.pujaCategory;
      existingItem.pujaCategoryTitle = normalizedPujaService.pujaCategoryTitle;
      // Preserve existing English title — do NOT overwrite with Hindi puja name
      if (!existingItem.title || existingItem.title === normalizedPujaService.title) {
        existingItem.title = normalizedPujaService.title;
      }
      existingItem.icon = normalizedPujaService.icon;
      // Preserve existing badge and descriptions if explicitly set in SERVICES_DATA
      if (!existingItem.badge) { existingItem.badge = normalizedPujaService.badge; }
      if (!existingItem.priceText || existingItem.priceText === 'As per requirement') {
        existingItem.priceText = normalizedPujaService.priceText;
      }
      if (!existingItem.cardDescription) { existingItem.cardDescription = normalizedPujaService.cardDescription; }
      if (!existingItem.heroDescription) { existingItem.heroDescription = normalizedPujaService.heroDescription; }
      existingItem.duration = normalizedPujaService.duration;
      existingItem.mode = normalizedPujaService.mode;
      existingItem.bookingService = normalizedPujaService.bookingService;
    }

    for (i = 0; i < pujas.length; i++) {
      var puja = pujas[i];
      var pujaSlug = normalizeSlug(puja.slug);

      if (!existingBySlug[pujaSlug]) {
        var serviceItem = buildPujaServiceItem(puja);
        SERVICES_DATA.push(serviceItem);
        existingBySlug[pujaSlug] = serviceItem;
      }
    }
  }

  function inferServiceType(serviceItem) {
    if (!serviceItem) {
      return 'consultation';
    }

    if (serviceItem.bookingService === 'Kundali Milan') {
      return 'matchmaking';
    }

    if (serviceItem.bookingService === 'Vastu Shastra' || serviceItem.bookingService === 'Industrial / Corporate Vastu') {
      return 'vastu';
    }

    if (serviceItem.bookingService === 'Pujan / Remedies') {
      return 'puja';
    }

    return 'consultation';
  }

  function syncServiceTypes() {
    for (var i = 0; i < SERVICES_DATA.length; i++) {
      SERVICES_DATA[i].type = inferServiceType(SERVICES_DATA[i]);
    }
  }

  syncPujaCategoryCounts();
  syncPujaServicesCatalog();
  syncServiceTypes();

  function getServiceBySlug(slug) {
    for (var i = 0; i < SERVICES_DATA.length; i++) {
      if (SERVICES_DATA[i].slug === slug) {
        return SERVICES_DATA[i];
      }
    }
    return null;
  }

  function getServicesByCategory(categoryKey) {
    if (categoryKey === 'all') {
      return SERVICES_DATA.slice();
    }

    var items = [];
    for (var i = 0; i < SERVICES_DATA.length; i++) {
      if (SERVICES_DATA[i].category === categoryKey) {
        items.push(SERVICES_DATA[i]);
      }
    }
    return items;
  }

  function getPujaCategoryBySlug(categorySlug) {
    var normalized = normalizeSlug(categorySlug);

    for (var i = 0; i < pujaCategories.length; i++) {
      if (normalizeSlug(pujaCategories[i].slug) === normalized) {
        return pujaCategories[i];
      }
    }

    return null;
  }

  function getPujasByCategory(categorySlug) {
    var normalized = normalizeSlug(categorySlug);
    var items = [];

    for (var i = 0; i < pujas.length; i++) {
      if (normalizeSlug(pujas[i].category) === normalized) {
        items.push(pujas[i]);
      }
    }

    return items;
  }

  window.SERVICE_CATEGORIES = SERVICE_CATEGORIES;
  window.SERVICE_HOME_CATEGORY_LIMITS = SERVICE_HOME_CATEGORY_LIMITS;
  window.SERVICE_HOME_ALL_PREVIEW = SERVICE_HOME_ALL_PREVIEW;
  window.PUJA_CATEGORIES_DATA = pujaCategories;
  window.PUJA_ITEMS_DATA = pujas;
  window.SERVICES_DATA = SERVICES_DATA;
  window.getServiceBySlug = getServiceBySlug;
  window.getServicesByCategory = getServicesByCategory;
  window.getPujaCategoryBySlug = getPujaCategoryBySlug;
  window.getPujasByCategory = getPujasByCategory;
})();
