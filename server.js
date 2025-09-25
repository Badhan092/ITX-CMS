require("dotenv").config();
const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

// Import routers
const pagesModule = require("./routes/pages");
const cmsModule = require("./routes/cmsSectionsRows");
const galleryModule = require("./routes/gallery");
const faqModule = require("./routes/faq");
const clientModule = require("./routes/client");
const newsBlogModule = require("./routes/newsBlog");
const caseStudyModule = require("./routes/caseStudy");
const pricingModule = require("./routes/pricing");
const testimonialsModule = require("./routes/testimonials");
const featureSectionModule = require("./routes/featureSection");


const app = express();
app.use(express.json());

// Allow requests from frontend
app.use(cors({
    origin: [/http:\/\/localhost:\d+$/], credentials: true,
}));

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

let conn;

// Wrap the DB connection in an async function
async function connectDB() {
    conn = await mysql.createConnection({
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASS || "",
        database: process.env.DB_NAME || "itx_db",
        port: process.env.DB_PORT || 3306,
        multipleStatements: false,
    });

    console.log("✅ MySQL connected!");

    // Pass connection to modules
    pagesModule.setConnection(conn);
    cmsModule.setConnection(conn);
    galleryModule.setConnection(conn);
    clientModule.setConnection(conn);
    faqModule.setConnection(conn);
    newsBlogModule.setConnection(conn);
    caseStudyModule.setConnection(conn);
    pricingModule.setConnection(conn);
    testimonialsModule.setConnection(conn);
    featureSectionModule.setConnection(conn);
}

// Initialize tables
async function initTables() {
    if (!conn) throw new Error("No DB connection");

    // pages table
    await conn.execute(`
    CREATE TABLE IF NOT EXISTS pages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL UNIQUE,
      description TEXT,
      content LONGTEXT,
      mediaUrl VARCHAR(255),
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

    // sections table
    await conn.execute(`
    CREATE TABLE IF NOT EXISTS sections (
      id INT AUTO_INCREMENT PRIMARY KEY,
      page_id INT NOT NULL,
      title VARCHAR(255) NULL,
      subtitle VARCHAR(255) NULL,
      classname VARCHAR(255) NOT NULL,
      position INT DEFAULT 0,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_sections_page FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

    // section_rows table
    await conn.execute(`
    CREATE TABLE IF NOT EXISTS section_rows (
      id INT AUTO_INCREMENT PRIMARY KEY,
      section_id INT NOT NULL,
      title VARCHAR(255) NULL,
      subtitle VARCHAR(255) NULL,
      button VARCHAR(255) NULL,
      content LONGTEXT NULL,
      mediaUrl VARCHAR(255) NULL,
      position INT DEFAULT 0,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_rows_section FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

    // feature_section table
    await conn.execute(`
    CREATE TABLE IF NOT EXISTS feature_section (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      subtitle VARCHAR(255),
      description LONGTEXT,
      slugs JSON,
      images JSON,
      button1 VARCHAR(255),
      button2 VARCHAR(255),
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

    // gallery table
    await conn.execute(`
    CREATE TABLE IF NOT EXISTS gallery (
      id INT AUTO_INCREMENT PRIMARY KEY,
      imageUrl VARCHAR(255) NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

    // client table
    await conn.execute(`
    CREATE TABLE IF NOT EXISTS client (
      id INT AUTO_INCREMENT PRIMARY KEY,
      imageUrl VARCHAR(255) NOT NULL,
      title VARCHAR(255),
      description TEXT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

    // news_blog table
    await conn.execute(`
    CREATE TABLE IF NOT EXISTS news_blog (
      id INT AUTO_INCREMENT PRIMARY KEY,
      imageUrl VARCHAR(255) NOT NULL,
      title VARCHAR(255) NOT NULL,
      subtitle VARCHAR(255),
      description TEXT,
      link VARCHAR(255),
      date DATE NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

    // case_study table
    await conn.execute(`
    CREATE TABLE IF NOT EXISTS case_study (
      id INT AUTO_INCREMENT PRIMARY KEY,
      imageUrl VARCHAR(255) NOT NULL,
      title VARCHAR(255) NOT NULL,
      subtitle VARCHAR(255),
      description TEXT,
      link VARCHAR(255),
      date DATE NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

    // faq table
    await conn.execute(`
    CREATE TABLE IF NOT EXISTS faq (
      id INT AUTO_INCREMENT PRIMARY KEY,
      question VARCHAR(255) NOT NULL,
      answer TEXT NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

    // pricing table
    await conn.execute(`
    CREATE TABLE IF NOT EXISTS pricing (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      tag VARCHAR(255),
      sub VARCHAR(255),
      price VARCHAR(50) NOT NULL,
      features JSON NOT NULL,
      active TINYINT(1) DEFAULT 0,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

    // testimonials table
    await conn.execute(`
    CREATE TABLE IF NOT EXISTS testimonials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255),
    subTitle VARCHAR(255),
    tag VARCHAR(100),
    text TEXT NOT NULL,
    img VARCHAR(500),
    name VARCHAR(255) NOT NULL,
    role VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`);


}



// Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, "uploads");
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, {recursive: true});
        cb(null, uploadDir);
    }, filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, Date.now() + "-" + Math.random().toString(36).slice(2, 8) + ext);
    },
});
const upload = multer({storage});

// Root route
app.get("/", (req, res) => res.send("CMS backend is running"));

// Upload endpoint
app.post("/api/upload", upload.single("file"), (req, res) => {
    if (!req.file) return res.status(400).json({message: "No file uploaded"});
    const url = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    res.json({url, filename: req.file.filename});
});

// Mount routers
app.use("/api", pagesModule.router);
app.use("/api", cmsModule.router);
app.use("/api", galleryModule.router);
app.use("/api", clientModule.router);
app.use("/api", newsBlogModule.router);
app.use("/api", caseStudyModule.router);
app.use("/api", pricingModule.router);
app.use("/api", faqModule.router);
app.use("/api", testimonialsModule.router);
app.use("/api", featureSectionModule.router);


// Start server
async function startServer() {
    try {
        await connectDB();
        await initTables();
        const PORT = process.env.PORT || 3001;
        app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
    } catch (err) {
        console.error("❌ Failed to start:", err);
    }
}

startServer();
