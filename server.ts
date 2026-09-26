import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const RU_API_BASE = "https://eresult.ru.ac.bd:9603/api";
const RU_PROFILE_API_BASE = "https://profile.ru.ac.bd/api";
const RU_PROFILE_API_KEY = "pms_ylb3lkyko0sruj8jao3n_GB65osTJfN3WDtweBxD48Wvpkwpihdq5R3eUTm5X1I1kuYNt";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Proxy endpoint for RU API to handle browser CORS or network sandbox issues smoothly
  app.all("/api/proxy/*", async (req, res) => {
    try {
      // Extract sub-path following /api/proxy/
      const endpointPath = req.params[0] || "";
      const targetUrl = `${RU_API_BASE}/${endpointPath}`;

      const headers: Record<string, string> = {
        "Accept": "application/json",
        "Content-Type": "application/json",
      };

      if (req.headers.authorization) {
        headers["Authorization"] = req.headers.authorization;
      }

      const fetchOptions: RequestInit = {
        method: req.method,
        headers,
      };

      if (req.method !== "GET" && req.method !== "HEAD" && req.body && Object.keys(req.body).length > 0) {
        fetchOptions.body = JSON.stringify(req.body);
      }

      const response = await fetch(targetUrl, fetchOptions);
      const data = await response.json().catch(() => null);

      res.status(response.status).json(data || { status: false, message: "Invalid JSON response from server" });
    } catch (error: any) {
      res.status(502).json({
        status: false,
        message: "Failed to communicate with RU e-result server",
        error: error.message,
      });
    }
  });

  // In-memory cache for RU Profile API to make responses lightning fast
  const ruProfileCache = new Map<string, { data: any; timestamp: number; contentType?: string }>();
  const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes cache

  // Aggregated Full Profile endpoint for instant 1-shot profile loading
  app.get("/api/ru-profile/employee/:salaryId/full", async (req, res) => {
    const salaryId = req.params.salaryId;
    const cacheKey = `full_profile_${salaryId}`;
    const cached = ruProfileCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return res.json(cached.data);
    }

    try {
      const fetchSub = async (path: string) => {
        try {
          const subKey = `ru_${path}`;
          const subCached = ruProfileCache.get(subKey);
          if (subCached && Date.now() - subCached.timestamp < CACHE_TTL_MS) {
            return subCached.data;
          }
          const resp = await fetch(`${RU_PROFILE_API_BASE}${path}`, {
            headers: {
              "Accept": "application/json",
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
              "api-key": RU_PROFILE_API_KEY,
            },
          });
          const json = await resp.json().catch(() => null);
          if (json) {
            ruProfileCache.set(subKey, { data: json, timestamp: Date.now() });
          }
          return json;
        } catch {
          return null;
        }
      };

      const [
        aboutRes,
        detailRes,
        educationsRes,
        employmentsRes,
        publicationsRes,
        researchInterestsRes,
        researchProjectsRes,
        researchSupervisionsRes,
        researchTalksRes,
        awardsRes,
        membershipsRes,
        extraDutiesRes,
        resourcesRes,
        socialLinksRes,
        othersRes,
      ] = await Promise.all([
        fetchSub(`/employee/${salaryId}/about`),
        fetchSub(`/employee/${salaryId}/detail`),
        fetchSub(`/employee/${salaryId}/educations`),
        fetchSub(`/employee/${salaryId}/employments`),
        fetchSub(`/employee/${salaryId}/publications`),
        fetchSub(`/employee/${salaryId}/research-interests`),
        fetchSub(`/employee/${salaryId}/research-projects`),
        fetchSub(`/employee/${salaryId}/research-supervisions`),
        fetchSub(`/employee/${salaryId}/research-talks`),
        fetchSub(`/employee/${salaryId}/awards`),
        fetchSub(`/employee/${salaryId}/memberships`),
        fetchSub(`/employee/${salaryId}/extra-duties`),
        fetchSub(`/employee/${salaryId}/resources`),
        fetchSub(`/employee/${salaryId}/social-links`),
        fetchSub(`/employee/${salaryId}/others`),
      ]);

      const fullData = {
        about: aboutRes?.employee || null,
        detail: detailRes || null,
        educations: educationsRes?.educations || [],
        employments: employmentsRes?.employments || [],
        publications: publicationsRes?.publications || [],
        researchInterests: researchInterestsRes?.research_interests || [],
        researchProjects: researchProjectsRes?.research_projects || [],
        researchSupervisions: researchSupervisionsRes?.research_supervisions || [],
        researchTalks: researchTalksRes?.research_talks || [],
        awards: awardsRes?.awards || [],
        memberships: membershipsRes?.memberships || [],
        extraDuties: extraDutiesRes?.extra_duties || [],
        resources: resourcesRes?.resources || [],
        socialLinks: socialLinksRes?.social_links || null,
        others: othersRes?.others?.value || null,
      };

      ruProfileCache.set(cacheKey, { data: fullData, timestamp: Date.now() });
      res.json(fullData);
    } catch (err: any) {
      res.status(502).json({
        status: false,
        message: "Failed to aggregate RU employee profile",
        error: err.message,
      });
    }
  });

  // Proxy endpoint for RU Profile Directory API (profile.ru.ac.bd)
  app.all("/api/ru-profile/*", async (req, res) => {
    try {
      const rawPath = req.originalUrl.replace(/^\/api\/ru-profile\/?/, "");
      const targetUrl = `${RU_PROFILE_API_BASE}/${rawPath}`;
      const cacheKey = `proxy_${rawPath}`;

      // Check cache for GET requests (except CV download)
      if (req.method === "GET" && !rawPath.includes("/cv")) {
        const cached = ruProfileCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
          return res.json(cached.data);
        }
      }

      const headers: Record<string, string> = {
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "api-key": RU_PROFILE_API_KEY,
      };

      const fetchOptions: RequestInit = {
        method: req.method,
        headers,
      };

      if (req.method !== "GET" && req.method !== "HEAD" && req.body && Object.keys(req.body).length > 0) {
        headers["Content-Type"] = "application/json";
        fetchOptions.body = JSON.stringify(req.body);
      }

      const response = await fetch(targetUrl, fetchOptions);
      const contentType = response.headers.get("content-type") || "";

      if (contentType.includes("pdf") || contentType.includes("octet-stream")) {
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        res.setHeader("Content-Type", contentType);
        const disposition = response.headers.get("content-disposition");
        if (disposition) res.setHeader("Content-Disposition", disposition);
        res.status(response.status).send(buffer);
        return;
      }

      const data = await response.json().catch(() => null);
      if (req.method === "GET" && data) {
        ruProfileCache.set(cacheKey, { data, timestamp: Date.now() });
      }
      res.status(response.status).json(data || { status: false, message: "Invalid JSON response from RU Profile server" });
    } catch (error: any) {
      res.status(502).json({
        status: false,
        message: "Failed to communicate with RU Profile API",
        error: error.message,
      });
    }
  });

  // -------------------------------------------------------------
  // Teacher Ratings & Student Feedback System
  // -------------------------------------------------------------
  const ratingsFilePath = path.join(process.cwd(), "data", "ratings.json");

  const readRatings = () => {
    try {
      if (fs.existsSync(ratingsFilePath)) {
        return JSON.parse(fs.readFileSync(ratingsFilePath, "utf-8"));
      }
    } catch (_e) {}
    return {};
  };

  const writeRatings = (data: any) => {
    try {
      const dataDir = path.dirname(ratingsFilePath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      fs.writeFileSync(ratingsFilePath, JSON.stringify(data, null, 2), "utf-8");
    } catch (_e) {}
  };

  // GET all teacher ratings
  app.get("/api/ratings", (req, res) => {
    const ratings = readRatings();
    res.json({ status: true, data: ratings });
  });

  // POST new rating or update student's rating for a teacher
  app.post("/api/ratings", (req, res) => {
    try {
      const {
        teacherKey,
        teacherName,
        salaryId,
        studentId,
        studentName,
        rating,
        criteria,
        comment,
        courseCode,
        isAnonymous,
      } = req.body;

      if (!teacherKey || !studentId || typeof rating !== "number" || rating < 1 || rating > 5) {
        return res.status(400).json({
          status: false,
          message: "Valid teacherKey, studentId, and rating (1-5) are required.",
        });
      }

      const allRatings = readRatings();
      const existing = allRatings[teacherKey] || {
        teacherKey,
        teacherName: teacherName || "",
        salaryId: salaryId || "",
        averageRating: 0,
        totalReviews: 0,
        reviews: [],
      };

      // Check if student already submitted a review for this teacher
      const existingReviewIndex = existing.reviews.findIndex((r: any) => r.studentId === studentId);
      const newReview = {
        studentId,
        studentName: isAnonymous ? "Anonymous Student" : (studentName || "Anonymous Student"),
        rating: Math.round(rating * 10) / 10,
        criteria: criteria || undefined,
        comment: (comment || "").trim(),
        courseCode: (courseCode || "").trim(),
        isAnonymous: !!isAnonymous,
        date: new Date().toISOString(),
      };

      if (existingReviewIndex >= 0) {
        existing.reviews[existingReviewIndex] = newReview;
      } else {
        existing.reviews.push(newReview);
      }

      // Recalculate average
      const sum = existing.reviews.reduce((acc: number, r: any) => acc + r.rating, 0);
      existing.totalReviews = existing.reviews.length;
      existing.averageRating = Math.round((sum / existing.totalReviews) * 10) / 10;

      // Recalculate criteria averages
      const criteriaKeys = ["teachingQuality", "punctuality", "helpfulness", "fairness"];
      const criteriaAverages: Record<string, number> = {};
      criteriaKeys.forEach((key) => {
        const validCriteria = existing.reviews.filter((r: any) => r.criteria && typeof r.criteria[key] === "number");
        if (validCriteria.length > 0) {
          const cSum = validCriteria.reduce((acc: number, r: any) => acc + r.criteria[key], 0);
          criteriaAverages[key] = Math.round((cSum / validCriteria.length) * 10) / 10;
        }
      });
      existing.criteriaAverages = Object.keys(criteriaAverages).length > 0 ? criteriaAverages : undefined;

      allRatings[teacherKey] = existing;

      // If salaryId is provided, also alias by salaryId
      if (salaryId && salaryId.trim()) {
        allRatings[salaryId.trim()] = existing;
      }

      writeRatings(allRatings);

      res.json({
        status: true,
        message: "Rating submitted successfully.",
        data: existing,
        myReview: newReview,
      });
    } catch (err: any) {
      res.status(500).json({ status: false, message: "Failed to save rating", error: err.message });
    }
  });

  // DELETE student's rating for a teacher
  app.delete("/api/ratings", (req, res) => {
    try {
      const { teacherKey, studentId, salaryId } = req.body;
      if (!teacherKey || !studentId) {
        return res.status(400).json({ status: false, message: "teacherKey and studentId are required" });
      }

      const allRatings = readRatings();
      const existing = allRatings[teacherKey];
      if (!existing || !Array.isArray(existing.reviews)) {
        return res.json({ status: true, message: "No reviews to delete", data: null });
      }

      existing.reviews = existing.reviews.filter((r: any) => r.studentId !== studentId);
      existing.totalReviews = existing.reviews.length;

      if (existing.totalReviews > 0) {
        const sum = existing.reviews.reduce((acc: number, r: any) => acc + r.rating, 0);
        existing.averageRating = Math.round((sum / existing.totalReviews) * 10) / 10;

        const criteriaKeys = ["teachingQuality", "punctuality", "helpfulness", "fairness"];
        const criteriaAverages: Record<string, number> = {};
        criteriaKeys.forEach((key) => {
          const validCriteria = existing.reviews.filter((r: any) => r.criteria && typeof r.criteria[key] === "number");
          if (validCriteria.length > 0) {
            const cSum = validCriteria.reduce((acc: number, r: any) => acc + r.criteria[key], 0);
            criteriaAverages[key] = Math.round((cSum / validCriteria.length) * 10) / 10;
          }
        });
        existing.criteriaAverages = Object.keys(criteriaAverages).length > 0 ? criteriaAverages : undefined;
      } else {
        existing.averageRating = 0;
        existing.criteriaAverages = undefined;
      }

      if (existing.totalReviews === 0) {
        delete allRatings[teacherKey];
        if (salaryId && salaryId.trim()) {
          delete allRatings[salaryId.trim()];
        }
      } else {
        allRatings[teacherKey] = existing;
        if (salaryId && salaryId.trim()) {
          allRatings[salaryId.trim()] = existing;
        }
      }

      writeRatings(allRatings);

      res.json({
        status: true,
        message: "Rating deleted successfully.",
        data: existing,
      });
    } catch (err: any) {
      res.status(500).json({ status: false, message: "Failed to delete rating", error: err.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`RU Student Dashboard server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
