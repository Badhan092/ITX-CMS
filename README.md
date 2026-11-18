# ITX-CMS

### Dynamic Content Management System Backend

ITX-CMS is a modular, API-driven Content Management System (CMS) backend built with **Node.js and Express.js**. It provides a centralized solution for managing dynamic website content, including pages, sections, galleries, blogs, case studies, pricing plans, FAQs, team members, careers, testimonials, and contact information.

The system uses MySQL for persistent data storage and provides RESTful API endpoints for frontend integration.

---

## Features

### 1. Dynamic Page Management
- Create and manage website pages.
- Maintain page titles, descriptions, slugs, and content.
- Organize pages into reusable sections.
- Manage individual section rows and their content.
- Control section and row ordering.

### 2. Content & Website Management
- Dynamic CMS sections and rows.
- Feature section management.
- Image gallery management.
- Client and client section management.
- News and blog management.
- Case study and case study section management.
- Pricing plan management.
- FAQ and FAQ section management.

### 3. Team & Career Management
- Manage team members and profiles.
- Configure team section content.
- Create and manage job postings.
- Manage job descriptions, requirements, responsibilities, and salary information.
- Handle job applications.
- Support resume uploads.

### 4. Business & Engagement Content
- Manage testimonials and testimonial sections.
- Manage contact section content.
- Store contact form submissions.
- Manage website content dynamically through API endpoints.

### 5. Media & File Uploads
- File upload functionality using Multer.
- Automatic upload directory creation.
- Unique filenames to avoid filename conflicts.
- Uploaded file URL generation.
- Dedicated API endpoint for serving uploaded files.

### 6. Database Management
- MySQL database integration.
- Automatic database table initialization.
- Relational data management using foreign keys.
- Automatic timestamps for content records.
- Cascading deletion for related records.

---

## Technology Stack

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express.js | Backend framework |
| MySQL | Relational database |
| MySQL2 | MySQL database connectivity |
| Multer | File upload handling |
| CORS | Cross-origin resource sharing |
| dotenv | Environment configuration |
| JSON | API request and response format |

### Additional Dependencies

The project also includes the following installed packages:

- bcryptjs
- jsonwebtoken
- mongoose
- lowdb
- nanoid
- body-parser

---

## Project Structure

```text
ITX-CMS/
│
├── routes/
│   ├── pages.js
│   ├── cmsSectionsRows.js
│   ├── gallery.js
│   ├── faqSection.js
│   ├── faq.js
│   ├── clientSection.js
│   ├── client.js
│   ├── newsBlog.js
│   ├── caseStudy.js
│   ├── caseStudySection.js
│   ├── pricing.js
│   ├── ourteam.js
│   ├── ourteamSection.js
│   ├── jobSection.js
│   ├── jobPost.js
│   ├── contactUs.js
│   ├── contactSection.js
│   ├── jobApplication.js
│   ├── testimonials.js
│   ├── testimonialSection.js
│   └── featureSection.js
│
├── uploads/
│   └── Uploaded media files
│
├── server.js
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

---

## Getting Started

Follow these instructions to run the project locally.

### Prerequisites

Make sure you have installed:

- [Node.js](https://nodejs.org/)
- npm
- [MySQL Server](https://dev.mysql.com/downloads/mysql/)
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/Badhan092/ITX-CMS.git
```

### 2. Navigate to the Project Directory

```bash
cd ITX-CMS
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the root directory.

```env
PORT=3001

DB_HOST=localhost
DB_USER=root
DB_PASS=your_mysql_password
DB_NAME=itx_db
DB_PORT=3306

FILE_BASE_URL=http://localhost:3001
```

Update the database credentials according to your MySQL configuration.

`FILE_BASE_URL` determines the base URL used when generating uploaded file URLs.

### 5. Create the MySQL Database

Create the database before starting the application.

```sql
CREATE DATABASE itx_db;
```

The application automatically initializes its required tables when the server starts.

### 6. Start the Development Server

```bash
npm run dev
```

### 7. Start the Production Server

```bash
npm start
```

The server will run at:

```text
http://localhost:3001
```

---

## API Overview

All application modules are mounted under the `/api` prefix.

| Module | Description |
|---|---|
| Pages | Website page management |
| CMS Sections & Rows | Dynamic page section management |
| Gallery | Gallery content management |
| Clients | Client and client section management |
| News & Blog | News and blog content |
| Case Studies | Case study management |
| Pricing | Pricing plan management |
| FAQ | Frequently asked questions |
| Team | Team member management |
| Careers | Job sections and job postings |
| Job Applications | Applicant information and resumes |
| Contact | Contact information and submissions |
| Testimonials | Customer testimonials |
| Features | Website feature sections |

### Health Check

```http
GET /
```

Returns:

```text
CMS backend is running
```

### File Upload

```http
POST /api/upload
```

Upload a file using `multipart/form-data`.

**Request field:**

```text
file: your-file
```

**Example response:**

```json
{
  "url": "http://localhost:3001/api/uploads/filename.jpg",
  "filename": "filename.jpg"
}
```

### Access Uploaded Files

```http
GET /api/uploads/:filename
```

Returns the requested uploaded file.

---

## Database Architecture

The application initializes its database tables automatically using MySQL.

Major database entities include:

- `pages`
- `sections`
- `section_rows`
- `feature_section`
- `gallery`
- `client_section`
- `client`
- `news_blog`
- `casestudy_section`
- `case_study`
- `pricing`
- `faq_section`
- `faq`
- `ourteam_section`
- `ourteam`
- `job_section`
- `job_posts`
- `job_applications`
- `contactus_section`
- `contact_us`
- `testimonial_section`
- `testimonials`

The database uses relational constraints to maintain relationships between pages, sections, rows, job posts, and applications.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm install` | Install project dependencies |
| `npm run dev` | Start development server with Nodemon |
| `npm start` | Start production server |

---

## Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Backend server port |
| `DB_HOST` | MySQL database host |
| `DB_USER` | MySQL username |
| `DB_PASS` | MySQL password |
| `DB_NAME` | Database name |
| `DB_PORT` | MySQL port |
| `FILE_BASE_URL` | Base URL for uploaded file links |

---

## Security & Configuration Notes

- Keep database credentials inside environment variables.
- Never commit your `.env` file.
- Configure CORS with the appropriate frontend origins before production deployment.
- Use appropriate file upload validation and size restrictions.
- Use HTTPS in production environments.
- Configure database backups and access permissions.

---

## Author

**MD. Badhan Chowdhury**

- GitHub: [@Badhan092](https://github.com/Badhan092)
- LinkedIn: [Badhan Chowdhury](https://www.linkedin.com/in/badhanchowdhury/)

---

## License

This project is licensed under the ISC License.

---

**ITX-CMS** — A modular backend solution for managing dynamic website content through RESTful APIs.
