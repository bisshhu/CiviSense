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
const generateComplaintApplication = async ({
    title,
    description,
    category,
    issueType,
    urgency,
    location,
    portals = [],
}) => {
    if (!title?.trim() || !description?.trim()) {
        throw new Error("Complaint title and description are required");
    }

    const portalInformation = portals.length
        ? portals
            .map(
                (portal) =>
                    `- ${portal.name} (${portal.department || "Government Department"})`
            )
            .join("\n")
        : "No specific government portal identified.";

    const prompt = `
Generate a formal civic complaint application based on the following complaint.

COMPLAINT DETAILS:
Title: ${title}
Description: ${description}
Category: ${category}
Issue Type: ${issueType}
Urgency: ${urgency}

LOCATION:
Address: ${location?.address || "Not available"}
Area: ${location?.area || "Not available"}
City: ${location?.city || "Not available"}
District: ${location?.district || "Not available"}
State: ${location?.state || "Not available"}
Postcode: ${location?.postcode || "Not available"}

RELEVANT GOVERNMENT AUTHORITIES/PORTALS:
${portalInformation}

REQUIREMENTS:
- Write a professional and polite complaint application suitable for submission to an Indian government authority.
- Clearly explain the civic problem.
- Include the exact location available above.
- Explain the impact/problem caused by the issue.
- Request appropriate action from the concerned authority.
- Do not invent facts that are not present in the complaint.
- Do not invent dates, names, phone numbers, addresses, complaint numbers, or other personal information.
- Do not include a fictional sender name.
- Do not include a fictional government officer's name.
- Keep the application concise but complete.
- Use a formal application format.
- Include a clear subject.
- Return only the complaint application.
- Do not include explanations before or after the application.
`;

    try {
        const response = await groq.chat.completions.create({
            model: "openai/gpt-oss-20b",
            temperature: 0.3,
            max_tokens: 800,
            messages: [
                {
                    role: "system",
                    content:
                        "You are an assistant that writes formal civic complaint applications for submission to Indian government authorities. Generate accurate, professional, concise applications using only the information provided.",
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
        });

        const application =
            response.choices?.[0]?.message?.content?.trim();

        if (!application) {
            throw new Error(
                "Received empty complaint application from AI model"
            );
        }

        return application;
    } catch (error) {
        console.error(
            "Error generating complaint application:",
            error
        );

        throw new Error(
            `Error generating complaint application: ${error.message}`
        );
    }
};
export {
    analyzeComplaint,
    analyzePortalRelevance,
    generateComplaintApplication
};