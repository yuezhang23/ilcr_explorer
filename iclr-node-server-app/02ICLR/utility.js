// Converted from utility.py
export const ratingScores = {
    1: "Very Strong Reject: For instance, a paper with incorrect statements, improper (e.g., offensive) language, unaddressed ethical considerations, incorrect results and/or flawed methodology (e.g., training using a test set).",
    2: "Strong Reject: For instance, a paper with major technical flaws, and/or poor evaluation, limited impact, poor reproducibility and mostly unaddressed ethical considerations.",
    3: "reject, not good enough",
    4: "Borderline reject: Technically solid paper where reasons to reject, e.g., limited evaluation, outweigh reasons to accept, e.g., good evaluation. Please use sparingly.",
    5: "marginally below the acceptance threshold",
    6: "marginally above the acceptance threshold",
    7: "Accept: Technically solid paper, with high impact on at least one sub-area, or moderate-to-high impact on more than one areas, with good-to-excellent evaluation, resources, reproducibility, and no unaddressed ethical considerations.",
    8: "accept, good paper",
    9: "Very Strong Accept: Technically flawless paper with groundbreaking impact on at least one area of AI/ML and excellent impact on multiple areas of AI/ML, with flawless evaluation, resources, and reproducibility, and no unaddressed ethical considerations.",
    10: "strong accept, should be highlighted at the conference"
};

export const confidenceScores = {
    1: "Your assessment is an educated guess. The submission is not in your area or the submission was difficult to understand. Math/other details were not carefully checked.",
    2: "You are willing to defend your assessment, but it is quite likely that you did not understand the central parts of the submission or that you are unfamiliar with some pieces of related work. Math/other details were not carefully checked.",
    3: "You are fairly confident in your assessment. It is possible that you did not understand some parts of the submission or that you are unfamiliar with some pieces of related work. Math/other details were not carefully checked.",
    4: "You are confident in your assessment, but not absolutely certain. It is unlikely, but not impossible, that you did not understand some parts of the submission or that you are unfamiliar with some pieces of related work.",
    5: "You are absolutely certain about your assessment. You are very familiar with the related work and checked the math/other details carefully."
};

export const correctnessScores = {
    3: "Some of the paper’s claims have minor issues. A few statements are not well-supported, or require small changes to be made correct."
};

export const technicalNoveltyAndSignificanceScores = {
    2: "The contributions are only marginally significant or novel."
};

export const empiricalNoveltyAndSignificanceScores = {
    3: "The contributions are significant and somewhat new. Aspects of the contributions exist in prior work."
};

export const miscScores = {
    1: "poor",
    2: "fair",
    3: "good",
    4: "excellent"
};

export const icml_recommendation = {
    5: "Strong accept",
    4: "Accept",
    3: "Weak accept (i.e., leaning towards accept, but could also be rejected)",
    2: "Weak reject (i.e., leaning towards reject, but could also be accepted)",
    1: "Reject"
};

export const fields_other = ['summary', 'soundness', 'presentation', 'contribution', 'strengths', 'weaknesses', 'questions', 'limitations', 'rating', 'confidence'];
export const numeric_fields_other = ['soundness', 'presentation', 'contribution', 'rating', 'confidence'];

export const fields_icml = [
    'summary', 'claims_and_evidence', 'methods_and_evaluation_criteria', 'theoretical_claims', 'experimental_designs_or_analyses', 'supplementary_material', 'relation_to_broader_scientific_literature',
    'essential_references_not_discussed', 'other_strengths_and_weaknesses', 'other_comments_or_suggestions', 'questions_for_authors',
    'overall_recommendation'
];
export const numeric_fields_icml = ['overall_recommendation'];

export function toString_no_rebuttal(metareviews) {
    let ret = "";
    for (let meta of metareviews) {
        if (meta.values && Object.keys(meta.values).length > 0) {
            ret += toString(meta.values);
        }
    }
    return ret;
}

export function toString_rebuttal(metareviews) {
    let ret = "";
    for (let meta of metareviews) {
        if (meta.values && Object.keys(meta.values).length > 0) ret += toString(meta.values);
        if (meta.rebuttal && meta.rebuttal.length > 0) {
            ret += add_rebuttal(meta.rebuttal);
        }
    }
    return ret;
}

export function add_rebuttal(rebuttals) {
    let ret = "";
    for (let rebuttal of rebuttals) {
        if (rebuttal.value === null || rebuttal.value === undefined) {
            ret += "COMMENT \n" + rebuttal.comment + "\n\n";
        }
        else {
            ret += "REPLY \n" + rebuttal.value + "\n\n";
        }
        if (rebuttal.comments && rebuttal.comments.length > 0) {
            for (let comment of rebuttal.comments) {
                ret += "REPLY \n" + comment.comment + "\n\n";
            }
        }
    }
    return ret;
}

export function toString(values, conference='ICLR') {
    let fields, numeric_fields;
    if (conference === 'ICML') {
        fields = fields_icml;
        numeric_fields = numeric_fields_icml;
    } else {
        fields = fields_other;
        numeric_fields = numeric_fields_other;
    }
    let ret = "REVIEW \n";
    for (let field of fields) {
        if (values[field] && values[field] !== 'not_provided') {
            ret += field;
            if (numeric_fields.includes(field)) {
                if (field === 'rating' || field === 'overall_recommendation') {
                    ret += ': ' + ratingScores[values[field]];
                } else if (field === 'confidence') {
                    ret += ': ' + confidenceScores[values[field]];
                } else if (field === 'correctness') {
                    ret += ': ' + correctnessScores[values[field]];
                } else if (field === 'technical novelty and significance') {
                    ret += ': ' + technicalNoveltyAndSignificanceScores[values[field]];
                } else if (field === 'empirical novelty and significance') {
                    ret += ': ' + empiricalNoveltyAndSignificanceScores[values[field]];
                } else {
                    ret += ': ' + miscScores[values[field]];
                }
            } else {
                ret += ": " + values[field];
            }
            ret += "\n\n";
        }
    }
    return ret;
}

export function parse_sectioned_prompt(s) {
    const result = {};
    let current_header = null;
    for (const lineRaw of s.split('\n')) {
        const line = lineRaw.trim();
        if (line.startsWith('# ')) {
            // first word without punctuation
            current_header = line.slice(2).trim().toLowerCase().split(' ')[0];
            current_header = current_header.replace(/[\p{P}$+<=>^`|~]/gu, '');
            result[current_header] = '';
        } else if (current_header !== null) {
            result[current_header] += line + '\n';
        }
    }
    return result;
}

export const prompt_tmp = "# Task\nGiven the following reviews (text), determine if a paper would be accepted (Yes) or not (No) by an academic conference. \n\n# Output format\nAnswer Yes or No as labels\n\n# Prediction\nText: {{ text }}\nLabel:";
export const prompt_tmp_sectioned = parse_sectioned_prompt(prompt_tmp);
