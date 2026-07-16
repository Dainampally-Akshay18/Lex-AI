# Simplified LexAI PRD (Version 1.1 - MVP)

## Product Vision

LexAI is an AI-powered legal document analysis platform that enables users to upload legal contracts and instantly analyze them using Microsoft AI Foundry and Semantic Kernel.

The platform helps users understand legal documents through AI-powered conversation, summaries, risk assessment, financial term extraction, multilingual responses, and professional report generation.

---

# Target Users

* Law Firms
* Startups
* Enterprises
* Students
* Individual Users

---

# Tech Stack

| Layer          | Technology           |
| -------------- | -------------------- |
| Frontend       | Next.js 15           |
| Backend        | FastAPI              |
| Database       | MongoDB              |
| AI Platform    | Microsoft AI Foundry |
| AI Framework   | Semantic Kernel      |
| Authentication | JWT                  |
| Charts         | Recharts             |
| PDF Processing | PyMuPDF              |
| Deployment     | Azure App Service    |

---

# Core Features

## 1. Upload Legal Document

Supported formats:

* PDF
* DOCX

Maximum Size:

25 MB

Processing Flow

```text
Upload

↓

Extract Text

↓

Store Original Text

↓

Ready for AI Analysis
```

---

# 2. AI Chat Assistant

Users can ask questions about the uploaded legal document.

Example

```
Who is the tenant?

↓

ABC Technologies Pvt Ltd
```

Features

* Context-aware responses
* Conversation history
* Clause references
* Follow-up questions

---

# 3. Document Summarization

Generate

* Executive Summary
* Quick Summary
* Detailed Summary
* Key Clauses
* Rights
* Obligations
* Important Dates

---

# 4. Risk Analysis

Automatically identify

* Payment Risk
* Liability Risk
* Confidentiality Risk
* Compliance Risk
* Jurisdiction Risk
* Renewal Risk
* Penalty Risk
* Termination Risk

Output

* Overall Risk Score
* Risk Breakdown
* Recommendations

---

# 5. Financial Terms Extraction

Extract

* Payment Amount
* Currency
* Taxes
* Interest
* Due Dates
* Penalties
* Security Deposit
* Contract Value

Display

Searchable table.

---

# 6. Multilingual Support

Languages

* English
* Telugu
* Hindi
* Tamil
* Kannada
* Malayalam

All AI responses are translated into the selected language.

---

# 7. AI Report Generation (Agent)

Instead of downloading multiple analyses individually, users can click:

```
Generate AI Report
```

The Report Generation Agent will:

1. Generate Executive Summary
2. Generate Risk Analysis
3. Extract Financial Terms
4. Collect Important Clauses
5. Generate Professional PDF Report

---

# Functional Requirements

## Authentication

* Register
* Login
* Logout
* JWT

---

## Dashboard

Display

* Recent Documents
* Upload Button
* Search Documents
* Delete Documents

---

## Document Analysis

Sidebar

```
Home

Chat

Summary

Risk

Financial

Language

Download Report
```

Each module loads independently.

---

# AI Architecture

## Semantic Kernel

Semantic Kernel acts as the AI orchestrator.

Instead of separate AI agents, every feature is implemented as an independent Semantic Kernel Skill.

Skills

* Chat Skill
* Summary Skill
* Risk Skill
* Financial Skill
* Translation Skill

Semantic Kernel routes requests to Microsoft AI Foundry.

---

# Report Generation Agent

The only autonomous AI Agent in the MVP.

Workflow

```text
User

↓

Generate Report

↓

Report Agent

↓

Summary Skill

↓

Risk Skill

↓

Financial Skill

↓

Translation (optional)

↓

Generate PDF

↓

Download
```

---

# Data Flow

```text
Upload PDF

↓

PyMuPDF

↓

Extract Text

↓

MongoDB

↓

Semantic Kernel

↓

Microsoft AI Foundry

↓

Return AI Response
```

---

# Database Collections

## Users

```
_id
name
email
passwordHash
createdAt
```

---

## Documents

```
_id
userId
fileName
documentText
uploadedAt
language
```

---

## Chats

```
_id
documentId
question
answer
createdAt
```

---

## Reports

```
_id
documentId
summary
risk
financial
generatedAt
```

---

# API Structure

```
/auth
    POST /register
    POST /login

/documents
    POST /upload
    GET /documents
    DELETE /document

/chat
    POST /ask

/summary
    GET /summary

/risk
    GET /analysis

/financial
    GET /extract

/language
    POST /translate

/report
    POST /generate
```

---

# Backend Structure

```
backend/app

routers/
    auth.py
    upload.py
    chat.py
    summary.py
    risk.py
    financial.py
    translate.py
    report.py

services/
    semantic_kernel/
    foundry/
    prompts/
    pdf_processor/

database/

models/

utils/

config/
```

---

# Frontend Structure

```
app/

login/

dashboard/

upload/

analysis/

chat/

summary/

risk/

financial/

language/

report/

components/

shared/

sidebar/

charts/
```

---

## .ENV file


# ======================================================
# APPLICATION
# ======================================================
APP_NAME=LexAI
APP_ENV=development
APP_HOST=0.0.0.0
APP_PORT=8000
DEBUG=True

# ======================================================
# JWT AUTHENTICATION
# ======================================================
JWT_SECRET_KEY=replace_with_a_long_random_secret_key
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=60

# ======================================================
# MONGODB
# ======================================================
MONGODB_URI=mongodb://localhost:27017
DATABASE_NAME=lexai

# ======================================================
# MICROSOFT AI FOUNDRY
# ======================================================
FOUNDRY_PROJECT_ENDPOINT=https://your-project.services.ai.azure.com/api/projects/your-project
FOUNDRY_API_KEY=your_foundry_api_key

# ======================================================
# MODEL DEPLOYMENTS
# ======================================================
CHAT_DEPLOYMENT=lexai-gpt

# ======================================================
# FRONTEND
# ======================================================
FRONTEND_URL=http://localhost:3000

# ======================================================
# FILE UPLOADS
# ======================================================
UPLOAD_DIRECTORY=uploads
MAX_FILE_SIZE_MB=25
SUPPORTED_FILE_TYPES=pdf,docx

# ======================================================
# AI SETTINGS
# ======================================================
TEMPERATURE=0.2
MAX_TOKENS=4000

# ======================================================
# PDF PROCESSING
# ======================================================
PDF_EXTRACTOR=pymupdf

# ======================================================
# REPORT GENERATION
# ======================================================
REPORT_OUTPUT_DIRECTORY=reports

# ======================================================
# LOGGING
# ======================================================
LOG_LEVEL=INFO