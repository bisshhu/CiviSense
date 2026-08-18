import { Portal } from "../models/portal.model.js";
import { analyzePortalRelevance } from "./ai.services.js";
const ISSUE_KEYWORDS = {
    road: [
        "road",
        "roads",
        "street",
        "infrastructure",
    ],

    pothole: [
        "pothole",
        "road",
        "roads",
        "street",
        "infrastructure",
    ],

    garbage: [
        "garbage",
        "waste",
        "sanitation",
        "solid waste",
        "cleanliness",
    ],

    water: [
        "water",
        "pipeline",
        "water supply",
        "leakage",
    ],

    electricity: [
        "electricity",
        "power",
        "electric",
        "transformer",
    ],

    drainage: [
        "drainage",
        "drain",
        "storm water",
        "sewer",
    ],

    streetlight: [
        "streetlight",
        "street light",
        "lighting",
        "lamp",
    ],

    sewage: [
        "sewage",
        "sewer",
        "wastewater",
    ],

    railway: [
        "railway",
        "rail",
        "train",
    ],

    "public safety": [
        "public safety",
        "safety",
        "danger",
        "hazard",
    ],

    other: [],
};

const isGovernmentDomain = (url) => {
    try {
        const hostname = new URL(url).hostname.toLowerCase();

        return (
            hostname.endsWith(".gov.in") ||
            hostname.endsWith(".nic.in")
        );
    } catch {
        return false;
    }
};
const findCachedPortals = async ({
    issueType,
    state,
    district,
    city,
}) => {
    const portals = await Portal.find({
        issueTypes: issueType,
        state: {
            $regex: `^${state}$`,
            $options: "i",
        },
        verified: true
    })
    return portals;
}

const searchGovernmentPortals = async ({
    issueType,
    state,
    district,
    city,
}) => {
    const query = `${issueType} complaint ${city} ${district} ${state} government portal`;
    const response = await fetch(
        "https://google.serper.dev/search",
        {
            method: "POST",
            headers: {
                "X-API-KEY": process.env.SERPER_API_KEY,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                q: query,
                num: 10,
            })

        }
    )
    if (!response.ok) {
        throw new Error(`Serper search failed: ${response.status}`)
    }
    const data = await response.json()
    return data.organic || []
}
const filterGovernmentResults = (
    results,
    { issueType, state, district, city }
) => {

    const locationKeywords = [
        city,
        district,
        state,
    ]
        .filter(Boolean)
        .map(value => value.toLowerCase());

    const complaintKeywords = [
        "complaint",
        "grievance",
        "lodge",
        "register",
        "report",
        "public grievance",
        "citizen grievance",
    ];

    return results.filter((result) => {

        const url =
            result.link?.toLowerCase() || "";

        const title =
            result.title?.toLowerCase() || "";

        const snippet =
            result.snippet?.toLowerCase() || "";

        const text =
            `${url} ${title} ${snippet}`;


        // 1. Government website
        if (!isGovernmentDomain(url)) {
            return false;
        }


        // 2. Relevant location
        const locationMatch =
            locationKeywords.some(keyword =>
                text.includes(keyword)
            );

        if (!locationMatch) {
            return false;
        }


        // 3. Complaint / grievance functionality
        const complaintMatch =
            complaintKeywords.some(keyword =>
                text.includes(keyword)
            );

        if (!complaintMatch) {
            return false;
        }


        return true;
    });
};
const verifyPortalUrl = async (url) => {

    const urlsToTry = [url];

    if (url.startsWith("http://")) {
        urlsToTry.push(
            url.replace(/^http:\/\//i, "https://")
        );
    }

    for (const testUrl of urlsToTry) {

        try {

            const response = await fetch(testUrl, {
                method: "GET",
                redirect: "follow",
                headers: {
                    "User-Agent": "Mozilla/5.0 CiviSense/1.0",
                },
            });

            if (response.ok) {
                return testUrl;
            }

            console.log(
                `${testUrl} returned ${response.status}`
            );

        } catch (error) {

            console.log(
                `Failed to verify ${testUrl}: ${error.message}`
            );
        }
    }

    return null;
};
const extractPortalLinks = async (url) => {
    try {
        const response = await fetch(url, {
            method: "GET",
            redirect: "follow",
        });

        if (!response.ok) {
            return [];
        }

        const html = await response.text();

        const links = [];

        // Extract href URLs from the page
        const hrefRegex = /href=["']([^"']+)["']/gi;

        let match;

        while ((match = hrefRegex.exec(html)) !== null) {
            links.push(match[1]);
        }

        // Also look for plain URLs inside the page
        const urlRegex =
            /https?:\/\/[^\s"'<>]+/gi;

        const textUrls = html.match(urlRegex) || [];

        links.push(...textUrls);

        return [...new Set(links)];

    } catch (error) {
        console.error(
            `Failed to inspect portal page: ${url}`,
            error.message
        );

        return [];
    }
};
const findComplaintLinks = (links) => {

    const strongKeywords = [
        "complaint",
        "grievance",
        "lodge",
        "register-complaint",
        "report-issue",
        "citizen-complaint",
    ];

    const ignoredDomains = [
        "facebook.com",
        "x.com",
        "twitter.com",
    ];

    return links.filter((link) => {
        const normalizedLink = link.toLowerCase();

        if (
            ignoredDomains.some(domain =>
                normalizedLink.includes(domain)
            )
        ) {
            return false;
        }

        return strongKeywords.some(keyword =>
            normalizedLink.includes(keyword)
        );
    });
};
const scorePortalLink = (link) => {
    try {
        const url = new URL(link);
        const hostname = url.hostname.toLowerCase();
        const path = url.pathname.toLowerCase();

        let score = 0;

        // Must be Indian government domain
        if (
            hostname.endsWith(".gov.in") ||
            hostname.endsWith(".nic.in")
        ) {
            score += 2;
        } else {
            return -Infinity;
        }

        // Strong complaint indicators
        const strongKeywords = [
            "complaint",
            "grievance",
            "lodge",
            "register",
            "report",
            "portal",
            "login",
            "citizen",
        ];

        for (const keyword of strongKeywords) {
            if (link.toLowerCase().includes(keyword)) {
                score += 5;
            }
        }

        // Reject files
        const badExtensions = [
            ".pdf",
            ".png",
            ".jpg",
            ".jpeg",
            ".gif",
            ".webp",
            ".doc",
            ".docx",
            ".xls",
            ".xlsx",
        ];

        if (
            badExtensions.some(ext =>
                path.endsWith(ext)
            )
        ) {
            score -= 20;
        }

        return score;

    } catch {
        return -Infinity;
    }
};

const selectBestPortal = (links, sourcePage) => {

    const sourceDomain =
        new URL(sourcePage).hostname;

    const candidates = links
        .filter((link) => {
            try {
                const linkDomain =
                    new URL(link).hostname;

                return (
                    linkDomain !== sourceDomain &&
                    isGovernmentDomain(link)
                );

            } catch {
                return false;
            }
        })
        .map(link => ({
            link,
            score: scorePortalLink(link),
        }))
        .filter(candidate =>
            candidate.score > 2
        )
        .sort((a, b) =>
            b.score - a.score
        );

    return candidates[0]?.link || null;
};
const checkPortalUrl = async (url) => {
    try {
        const response = await fetch(url, {
            method: "GET",
            redirect: "follow",
            headers: {
                "User-Agent": "Mozilla/5.0 CiviSense/1.0",
            },
        });

        return {
            reachable: response.ok,
            finalUrl: response.url || url,
            status: response.status,
        };

    } catch (error) {
        return {
            reachable: false,
            finalUrl: url,
            status: null,
            error: error.message,
        };
    }
};
const findGovernmentPortals = async ({
    complaintText,
    issueType,
    state,
    district,
    city,
}) => {

    // STEP 1: Check MongoDB cache
    const cachedPortals = await findCachedPortals({
        issueType,
        state,
        district,
        city,
    });

    if (cachedPortals.length > 0) {
        console.log("Using cached government portals");
        return cachedPortals;
    }

    // STEP 2: Search the web
    console.log("No cached portal found. Searching web...");

    const searchResults = await searchGovernmentPortals({
        issueType,
        state,
        district,
        city,
    });

    // STEP 3: Filter government results
    const filteredResults = filterGovernmentResults(
        searchResults,
        {
            issueType,
            state,
            district,
            city,
        }
    );

    if (filteredResults.length === 0) {
        return [];
    }

    const discoveredPortals = [];

    // STEP 4: Inspect government pages
    for (const result of filteredResults) {

        const sourcePage = result.link;

        const links = await extractPortalLinks(
            sourcePage
        );




        const portalUrl =
            selectBestPortal(links, sourcePage);
         if (!portalUrl) {
            console.log(
                `No actionable complaint portal found for ${sourcePage}`
            );

            continue;
        }
        const portalAnalysis = await analyzePortalRelevance({
            complaintText: `${complaintText} complaint`,
            issueType,
            state,
            district,
            city,
            portalName: result.title,
            portalUrl,
            portalDescription: result.snippet || "",
        });

        console.log("PORTAL AI ANALYSIS:");
        console.log(portalAnalysis);

        if (
            !portalAnalysis.relevant ||
            portalAnalysis.confidence < 0.7
        ) {
            console.log(
                `Portal rejected by AI: ${portalUrl}`
            );

            continue;
        }
       
        // STEP 5: Verify URL
        const verification = await checkPortalUrl(portalUrl);

        if (!verification.reachable) {
            console.log(
                `Could not automatically verify: ${portalUrl}`
            );
        }

        discoveredPortals.push({
            name: result.title,
            url: verification.finalUrl,
            sourcePage,
            department: "Government",
            state,
            district,
            city,
            issueTypes: [issueType],
            description: result.snippet || "",
            verified: verification.reachable,
            source: "serper",
            lastVerifiedAt: new Date(),
        });
    }

    // STEP 6: Save discovered portals
    if (discoveredPortals.length > 0) {

        const savedPortals =
            await Portal.insertMany(
                discoveredPortals
            );

        return savedPortals;
    }

    return [];
};


export {
    findCachedPortals,
    searchGovernmentPortals,
    filterGovernmentResults,
    verifyPortalUrl,
    extractPortalLinks,
    findComplaintLinks,
    findGovernmentPortals,
}