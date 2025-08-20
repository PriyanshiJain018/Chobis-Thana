// Gunasthans Data - Complete information about all 14 spiritual stages

export const gunasthansData = {
    1: {
        nameHi: "मिथ्यात्व",
        nameEn: "Mithyatva",
        english: "False Belief",
        description: "The soul has completely wrong beliefs about the nature of reality, soul, and spiritual path.",
        color: "#EF4444"
    },
    2: {
        nameHi: "सासादन",
        nameEn: "Sasadan",
        english: "Taste of Right Belief",
        description: "Brief experience of right belief but falls back to wrong belief immediately.",
        color: "#F97316"
    },
    3: {
        nameHi: "मिश्र",
        nameEn: "Mishra",
        english: "Mixed Belief",
        description: "Mixture of right and wrong beliefs. Neither completely right nor completely wrong.",
        color: "#EAB308"
    },
    4: {
        nameHi: "अविरत सम्यग्दृष्टि",
        nameEn: "Avirata Samyagdristi",
        english: "Right Belief without Vows",
        description: "Firm right belief about the nature of soul and spiritual path, but no formal vows taken.",
        color: "#84CC16"
    },
    5: {
        nameHi: "देशविरत",
        nameEn: "Deshvirata",
        english: "Partial Vows",
        description: "Takes partial vows as a householder while maintaining worldly responsibilities.",
        color: "#22C55E"
    },
    6: {
        nameHi: "प्रमत्तविरत",
        nameEn: "Pramattavirata",
        english: "Complete Vows with Negligence",
        description: "Takes complete monastic vows but still experiences some negligence in conduct.",
        color: "#10B981"
    },
    7: {
        nameHi: "अप्रमत्तविरत",
        nameEn: "Apramattavirata",
        english: "Complete Vows without Negligence",
        description: "Perfect observance of monastic vows with complete vigilance and no negligence.",
        color: "#06B6D4"
    },
    8: {
        nameHi: "अपूर्वकरण",
        nameEn: "Apurvakarana",
        english: "Unprecedented Spiritual Activity",
        description: "Soul begins unprecedented spiritual purification process, transforming karmic bondage.",
        color: "#0EA5E9"
    },
    9: {
        nameHi: "अनिवृत्तिकरण",
        nameEn: "Anivrittikarana",
        english: "Irreversible Spiritual Activity",
        description: "Irreversible spiritual transformation continues, steadily destroying karmic impurities.",
        color: "#3B82F6"
    },
    10: {
        nameHi: "सूक्ष्मसाम्पराय",
        nameEn: "Sukshasamparaya",
        english: "Subtle Greed",
        description: "Only the most subtle form of greed (lobha) remains. All other passions destroyed.",
        color: "#6366F1"
    },
    11: {
        nameHi: "उपशांत मोह",
        nameEn: "Upashanta Moha",
        english: "Subsided Delusion",
        description: "All deluding karmas are temporarily subsided but not destroyed.",
        color: "#8B5CF6"
    },
    12: {
        nameHi: "क्षीणमोह",
        nameEn: "Kshina Moha",
        english: "Destroyed Delusion",
        description: "All deluding karmas are permanently destroyed. No return to lower stages.",
        color: "#A855F7"
    },
    13: {
        nameHi: "सयोगकेवली",
        nameEn: "Sayogakevali",
        english: "Omniscient with Activity",
        description: "Soul achieves omniscience but still has bodily activities.",
        color: "#EC4899"
    },
    14: {
        nameHi: "अयोगकेवली",
        nameEn: "Ayogakevali",
        english: "Omniscient without Activity",
        description: "Final stage before liberation. No mental, verbal, or physical activities.",
        color: "#F59E0B"
    }
};

// Transition rules for Gunasthanas
export const transitionRules = {
    1: { canGoTo: [3, 4, 5, 7], description: "विशेष - तीसरा गुणस्थान (केवल प्रथमोपशम सम्यक्त्व के बाद ही संभव)" },
    2: { canGoTo: [1], description: "" },
    3: { canGoTo: [1, 4], description: "Can fall to false belief or progress to right belief" },
    4: { canGoTo: [1, 2, 3, 5, 7], description: "Multiple paths including direct jump to complete vows" },
    5: { canGoTo: [1, 2, 3, 4, 7], description: "Can fall back or progress to monastic life" },
    6: { canGoTo: [1, 2, 3, 4, 5, 7], description: "Can progress to careful conduct or spiritual ladder" },
    7: { canGoTo: [6, 8], description: "विशेष - मरण की अपेक्षा से चतुर्थ गुणस्थान भी संभव " },
    8: { canGoTo: [7, 9], description: "विशेष - मरण की अपेक्षा से चतुर्थ गुणस्थान भी संभव " },
    9: { canGoTo: [7, 10], description: "Can fall back or reach subtle greed stage" },
    10: { canGoTo: [7, 11, 12], description: "Can fall, subside, or destroy delusion" },
    11: { canGoTo: [1, 12, 13], description: "विशेष - मरण की अपेक्षा से चतुर्थ गुणस्थान भी संभव" },
    12: { canGoTo: [13], description: "Progresses to omniscience" },
    13: { canGoTo: [14], description: "Final transition to liberation" },
    14: { canGoTo: [], description: "Liberation (Moksha) - No further transitions" }
};
