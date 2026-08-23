import Groq from "groq-sdk"
//Think of the SDK as a JavaScript library that lets your Node.js backend communicate with Groq's API without manually constructing HTTP requests.
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
})

const ISSUE_TYPE = [
    "road",
    "pothole",
    "garbage",
    "water",
    "electricity",
    "drainage",
    "streetlight",
    "sewage",
    "railway",
    "public safety",
    "other",
]

const URGENCY_LEVELS = [
    "low",
    "medium",
    "high",
]

const analyzeComplaint = async (complaintText) => {
    if (!complaintText.trim()) {
        throw new Error("Complaint text cannot be empty");
    }

    const prompt = `Analyze the following civic complaint from india 
    Complaint: ${complaintText}
    {
    "issue_type": "road/pothole/garbage/water/electricity/drainage/streetlight/sewage/railway/public safety/other",
    "urgency": "low/medium/high"
}
    Rules:
- Classify the issue type accurately.
- Assess urgency based primarily on safety impact.
- Use "pothole" when the complaint specifically concerns potholes.
- Use "road" for general road/infrastructure problems that are not specifically potholes.
- Use "public safety" when the complaint directly involves a serious public safety concern.
- Do not return explanations.
- Return JSON only.
`;
    try {
        const response = await groq.chat.completions.create({
            model: "openai/gpt-oss-20b",
            temperature: 0.2,
            max_tokens: 300,
            messages: [
                {
                    role: "system",
                    content: "You are a civic complaint analysis assistant. Your task is to classify civic complaints into specific issue types and assess their urgency based on safety impact. Respond only in JSON format."
                },
                {
                    role: "user",
                    content: prompt
                }
            ]
        });
        console.log(
            "PORTAL AI RAW RESPONSE:",
            JSON.stringify(response, null, 2)
        );

        const content =
            response.choices?.[0]?.message?.content?.trim();
        if (!content) {
            throw new Error("Received empty response from AI model");
        }
        const cleanedResponse = content
            .replace(/^```json\s*/i, "")
            .replace(/^```\s*/i, "")
            .replace(/\s*```$/i, "")
            .trim();

        let parsedResponse;

        try {
            parsedResponse = JSON.parse(cleanedResponse);
        } catch (parseError) {
            throw new Error(`AI returned invalid json`);
        }
        const issueType = parsedResponse.issue_type?.toLowerCase();
        const urgency = parsedResponse.urgency?.toLowerCase();

        if (!ISSUE_TYPE.includes(issueType)) {
            throw new Error(`Invalid issue type returned by AI: ${issueType}`);
        }
        if (!URGENCY_LEVELS.includes(urgency)) {
            throw new Error(`Invalid urgency level returned by AI: ${urgency}`);
        }
        return { issueType, urgency };
    } catch (error) {
        console.error("Error analyzing complaint:", error);
        throw new Error(`Error analyzing complaint: ${error.message}`);
    }
}
const analyzePortalRelevance = async ({
    complaintText,
    issueType,
    state,
    district,
    city,
    portalName,
    portalUrl,
    portalDescription,
}) => {

    console.log("Portal relevance AI temporarily bypassed.");

    return {
        relevant: true,
        confidence: 0.8,
        reason:
            "Government portal discovered for the complaint location.",
    };
};
export {
    analyzeComplaint,
    analyzePortalRelevance
};