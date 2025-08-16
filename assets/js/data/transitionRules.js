const transitionRules = {
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
