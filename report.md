# Discrete Manufacturing Company - Project Report

## 1. Project Overview

This project is a Proof of Concept (PoC) for **Design Change Impact Assessment Intelligence (DCIA)** in a discrete manufacturing / shipbuilding context. It helps a user ask a natural-language question such as:

`Increase main engine power by 15%. What systems are affected?`

The system then:

1. Interprets the design-change request.
2. Finds related systems affected by that change using a Neo4j graph.
3. Checks which class or compliance rules apply.
4. Looks for similar historical changes.
5. Estimates the likely cost impact.
6. Produces a human-readable assessment report.

The project has two main parts:

- `backend/`: FastAPI service that performs the analysis.
- `dcia-ui/`: React frontend that sends the user request and displays results.

## 2. Main Objectives

The main objectives of this project are:

- Build a conversational interface for engineering design-change analysis.
- Trace cascading impact across connected systems instead of assessing a change in isolation.
- Bring together graph data, rule checks, historical analogues, and cost estimation in one workflow.
- Present the result in a simple dashboard suitable for quick decision support.
- Demonstrate how AI-style interaction can be combined with engineering knowledge structures.

## 3. High-Level Architecture

### Backend

The backend is built with **FastAPI** and exposes two endpoints:

- `GET /api/health`
- `POST /api/chat`

It depends on:

- **Neo4j** for relationship-based impact analysis
- **Python services** for intent extraction, graph queries, and cost estimation
- A **mock LLM service** that simulates intent parsing and final report generation

### Frontend

The frontend is built with:

- **React**
- **TypeScript**
- **Axios**
- **Recharts**
- **Framer Motion**
- **Tailwind-based styling**

It collects the user’s design-change request, calls the backend API, and renders:

- generated report
- cost estimate chart
- affected systems
- class rule flags
- historical analogues

## 4. How the Project Works

The end-to-end flow is:

1. The user enters a design-change request in the web UI.
2. The frontend sends that text to `POST /api/chat`.
3. The backend extracts a structured intent from the text.
4. The backend queries Neo4j for cascading impacts from the target system.
5. The backend fetches class-rule data for all affected systems.
6. The backend searches historical design changes using extracted keywords.
7. The backend calculates a cost range using a simplified parametric model.
8. The backend combines all collected data into a final synthesized report.
9. The frontend displays the report and supporting analysis visually.

## 5. Step-by-Step Execution With Commands

### Step 1: Open the project

```powershell
cd "d:\Placement materials\Navajna\Internship\AI powered module\Discrete-Manufacturing-Company"
```

### Step 2: Start the backend

Move into the backend folder:

```powershell
cd backend
```

Create a virtual environment if needed:

```powershell
python -m venv .venv
```

Activate it on PowerShell:

```powershell
.venv\Scripts\Activate.ps1
```

Install backend dependencies:

```powershell
pip install -r requirements.txt
```

Set the Neo4j environment variables in `backend/.env`:

```env
NEO4J_URI=...
NEO4J_USER=...
NEO4J_PASSWORD=...
```

Run the FastAPI server:

```powershell
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Check health:

```powershell
curl http://localhost:8000/api/health
```

### Step 3: Start the frontend

Open a new terminal and move into the UI folder:

```powershell
cd "d:\Placement materials\Navajna\Internship\AI powered module\Discrete-Manufacturing-Company\dcia-ui"
```

Install frontend dependencies:

```powershell
npm install
```

Run the development server:

```powershell
npm start
```

The UI opens at:

```text
http://localhost:3000
```

### Step 4: Submit a design-change query

Example queries supported by the current PoC:

- `Increase main engine power by 15% for improved speed`
- `Replace the shaft generator with a new 3MW unit`
- `Add structural stiffening for a new weapons mount`
- `Increase fuel tank capacity by 20%`

You can also test the backend directly:

```powershell
curl -X POST http://localhost:8000/api/chat ^
  -H "Content-Type: application/json" ^
  -d "{\"message\":\"Increase fuel tank capacity by 20%\"}"
```

### Step 5: View the generated assessment

After submission, the frontend shows:

- synthesized report
- cost projection chart
- impacted systems table
- class-rule flags
- historical insights

## 6. Backend Workflow in Detail

The main orchestration happens in [backend/main.py](/d:/Placement%20materials/Navajna/Internship/AI%20powered%20module/Discrete-Manufacturing-Company/backend/main.py).

### 6.1 Application setup

Relevant parts:

- [backend/main.py:14](/d:/Placement%20materials/Navajna/Internship/AI%20powered%20module/Discrete-Manufacturing-Company/backend/main.py#L14)
- [backend/main.py:16](/d:/Placement%20materials/Navajna/Internship/AI%20powered%20module/Discrete-Manufacturing-Company/backend/main.py#L16)
- [backend/main.py:21](/d:/Placement%20materials/Navajna/Internship/AI%20powered%20module/Discrete-Manufacturing-Company/backend/main.py#L21)

What it does:

- loads environment variables
- creates a Neo4j driver
- creates the FastAPI app
- enables permissive CORS so the frontend can call the API

### 6.2 Request model

Relevant part:

- [backend/main.py:25](/d:/Placement%20materials/Navajna/Internship/AI%20powered%20module/Discrete-Manufacturing-Company/backend/main.py#L25)

What it does:

- defines `ChatRequest`
- ensures the `/api/chat` endpoint expects a JSON body containing `message`

### 6.3 Main analysis pipeline

Relevant part:

- [backend/main.py:28](/d:/Placement%20materials/Navajna/Internship/AI%20powered%20module/Discrete-Manufacturing-Company/backend/main.py#L28)

What it does:

1. **Extract intent**
   - Calls `extract_intent(req.message)`.
   - Converts free text into structured fields such as system, system ID, magnitude, and keywords.

2. **Get cascading impacts**
   - Calls `get_cascade_impacts(...)`.
   - Finds systems connected by `CASCADES_TO` relationships.

3. **Get class rules**
   - Builds a list of affected system IDs.
   - Calls `get_class_rules_for_systems(...)`.
   - Returns rules governing those systems.

4. **Get historical analogues**
   - Calls `get_similar_historical_changes(...)`.
   - Looks for previous changes whose descriptions contain similar keywords.

5. **Estimate cost**
   - Extracts the numerical magnitude from the user query.
   - Calls `estimate_cost(...)`.
   - Produces P10, P50, and P90 cost estimates.

6. **Synthesize final report**
   - Calls `synthesise_report(...)`.
   - Converts raw data into a readable text summary.

7. **Return JSON response**
   - Sends intent, impacts, class rules, historical data, cost estimate, and report back to the frontend.

### 6.4 Health endpoint

Relevant part:

- [backend/main.py:65](/d:/Placement%20materials/Navajna/Internship/AI%20powered%20module/Discrete-Manufacturing-Company/backend/main.py#L65)

What it does:

- returns `{"status": "ok"}`
- useful for checking whether the backend is running

## 7. Important Service Files

### 7.1 Neo4j service

File:

- [backend/services/neo4j_service.py](/d:/Placement%20materials/Navajna/Internship/AI%20powered%20module/Discrete-Manufacturing-Company/backend/services/neo4j_service.py)

Important functions:

- [backend/services/neo4j_service.py:18](/d:/Placement%20materials/Navajna/Internship/AI%20powered%20module/Discrete-Manufacturing-Company/backend/services/neo4j_service.py#L18) `get_cascade_impacts`
- [backend/services/neo4j_service.py:36](/d:/Placement%20materials/Navajna/Internship/AI%20powered%20module/Discrete-Manufacturing-Company/backend/services/neo4j_service.py#L36) `get_class_rules_for_systems`
- [backend/services/neo4j_service.py:47](/d:/Placement%20materials/Navajna/Internship/AI%20powered%20module/Discrete-Manufacturing-Company/backend/services/neo4j_service.py#L47) `get_similar_historical_changes`

What each important part does:

`get_cascade_impacts`

- starts from a `ShipSystem` node using a given system ID
- follows `CASCADES_TO` relationships up to 3 hops
- collects:
  - affected system ID
  - name
  - discipline
  - hop count
  - reasons for the cascade
  - severity
- returns the affected systems ordered by hop distance

`get_class_rules_for_systems`

- takes a list of system IDs
- matches `ShipSystem` nodes connected to `ClassRule` nodes by `GOVERNED_BY`
- returns the system name, society, clause, and rule description
- this is the function that maps technical impacts to compliance or classification requirements

`get_similar_historical_changes`

- searches `DesignChange` nodes whose description matches any extracted keyword
- optionally joins related `CostRecord` nodes
- returns up to 3 historical examples
- provides real-world context for decision support

### 7.2 LLM service

File:

- [backend/services/llm_service.py](/d:/Placement%20materials/Navajna/Internship/AI%20powered%20module/Discrete-Manufacturing-Company/backend/services/llm_service.py)

Important functions:

- [backend/services/llm_service.py:6](/d:/Placement%20materials/Navajna/Internship/AI%20powered%20module/Discrete-Manufacturing-Company/backend/services/llm_service.py#L6) `extract_intent`
- [backend/services/llm_service.py:64](/d:/Placement%20materials/Navajna/Internship/AI%20powered%20module/Discrete-Manufacturing-Company/backend/services/llm_service.py#L64) `synthesise_report`

What each important part does:

`extract_intent`

- lowercases the user message
- extracts a percentage using regex
- classifies the request into one of a few supported system types:
  - fuel
  - electrical
  - structure
  - weapons
  - default propulsion
- returns a structured dictionary used by the rest of the backend

Important note:

- this is currently a **mock rule-based intent extractor**, not a real LLM call
- the `openai` package is installed, but the current service does not use the OpenAI API yet

`synthesise_report`

- receives impacts, class rules, historical results, and cost estimate
- formats them into a readable multi-section summary
- returns the report text shown in the UI

Important note:

- this is also a **mock text generator** for the PoC
- it demonstrates the reporting flow without requiring a live LLM integration

### 7.3 Cost model

File:

- [backend/services/cost_model.py](/d:/Placement%20materials/Navajna/Internship/AI%20powered%20module/Discrete-Manufacturing-Company/backend/services/cost_model.py)

Important parts:

- [backend/services/cost_model.py:4](/d:/Placement%20materials/Navajna/Internship/AI%20powered%20module/Discrete-Manufacturing-Company/backend/services/cost_model.py#L4) `DISCIPLINE_COST_FACTORS`
- [backend/services/cost_model.py:14](/d:/Placement%20materials/Navajna/Internship/AI%20powered%20module/Discrete-Manufacturing-Company/backend/services/cost_model.py#L14) `SEVERITY_MULTIPLIERS`
- [backend/services/cost_model.py:16](/d:/Placement%20materials/Navajna/Internship/AI%20powered%20module/Discrete-Manufacturing-Company/backend/services/cost_model.py#L16) `estimate_cost`

What each important part does:

`DISCIPLINE_COST_FACTORS`

- stores base costs and per-percent increase costs for each engineering discipline
- examples include propulsion, structure, electrical, weapons, outfitting, shafting, and fuel

`SEVERITY_MULTIPLIERS`

- scales cascade cost by impact severity
- `HIGH` adds the most cost impact
- `LOW` adds the least

`estimate_cost`

- calculates the cost of the primary requested change
- adds cost from impacted downstream systems
- returns:
  - primary system cost
  - cascade systems cost
  - P10 estimate
  - P50 estimate
  - P90 estimate
  - confidence level
  - note

Important note:

- this is a **simplified parametric model**
- the file explicitly says it should be replaced by a model based on real historical MDL data in production

## 8. Frontend Workflow in Detail

The main UI logic is in [dcia-ui/src/App.tsx](/d:/Placement%20materials/Navajna/Internship/AI%20powered%20module/Discrete-Manufacturing-Company/dcia-ui/src/App.tsx).

### Important parts

- [dcia-ui/src/App.tsx:33](/d:/Placement%20materials/Navajna/Internship/AI%20powered%20module/Discrete-Manufacturing-Company/dcia-ui/src/App.tsx#L33) `SEVERITY_COLORS`
- [dcia-ui/src/App.tsx:39](/d:/Placement%20materials/Navajna/Internship/AI%20powered%20module/Discrete-Manufacturing-Company/dcia-ui/src/App.tsx#L39) `ImpactResult`
- [dcia-ui/src/App.tsx:71](/d:/Placement%20materials/Navajna/Internship/AI%20powered%20module/Discrete-Manufacturing-Company/dcia-ui/src/App.tsx#L71) `App`

What each important part does:

`SEVERITY_COLORS`

- maps severity levels to badge colors
- helps users visually distinguish high, medium, and low impact items

`ImpactResult`

- defines the shape of data expected from the backend
- includes intent, impacts, class rules, historical results, cost estimate, and report

`App`

- manages the user input state
- sends the request to `http://localhost:8000/api/chat`
- stores the backend response
- renders the report dashboard
- shows loading and error states

### UI sections

The UI displays results in these major sections:

- **Hero input area** for entering the design-change prompt
- **Impact Assessment Report** card for the final synthesized text
- **Cost Estimate Projection** chart using Recharts
- **Affected Systems** table showing severity and hop count
- **Class Rule Flags** side panel for compliance concerns
- **Historical Insights** section for similar previous cases

## 9. Important Commands Used in the Project

### Backend commands

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend commands

```powershell
cd dcia-ui
npm install
npm start
npm run build
npm test
```

### API test commands

```powershell
curl http://localhost:8000/api/health
```

```powershell
curl -X POST http://localhost:8000/api/chat ^
  -H "Content-Type: application/json" ^
  -d "{\"message\":\"Replace the shaft generator with a new 3MW unit\"}"
```

## 10. Important Things in This Project

These are the most important ideas and implementation details to understand:

### 10.1 It is a PoC, not a production system

- the report generation is mocked
- intent extraction is rule-based
- cost estimation is simplified
- the system demonstrates the workflow, not final enterprise-grade accuracy

### 10.2 Neo4j is central to the project

- the graph database is what makes cascade analysis possible
- without the graph relationships, the system would lose its key differentiator
- `CASCADES_TO`, `GOVERNED_BY`, and historical change relationships are essential

### 10.3 `get_class_rules_for_systems` is a key compliance bridge

- this function converts impacted systems into regulatory/classification implications
- it is one of the most important functions because engineering impact alone is not enough for design decisions
- it adds standards/compliance awareness to the workflow

### 10.4 The backend is pipeline-oriented

- the `/api/chat` endpoint is the orchestration layer
- each service has a focused role
- this separation makes the project easier to upgrade later

### 10.5 The frontend is designed for decision support

- it is not just a chat box
- it turns the backend analysis into charts, tables, and flagged issues
- that makes the output more useful for engineers and reviewers

### 10.6 Environment configuration is required

- the backend needs Neo4j credentials from `.env`
- if these are missing or incorrect, graph queries will fail

### 10.7 The UI currently expects the backend at localhost

- the API base URL is hardcoded as `http://localhost:8000/api`
- if the backend runs elsewhere, the frontend code must be updated or configured differently

## 11. Strengths of the Project

- clear modular separation between UI, orchestration, graph access, and cost logic
- easy-to-understand end-to-end flow
- strong demonstration of combining structured engineering knowledge with AI-style interaction
- visually polished frontend for a PoC
- simple enough to extend with real LLM and ML models later

## 12. Limitations and Future Improvements

Current limitations:

- intent extraction supports only a few keyword-based scenarios
- report synthesis is template-based
- cost model is approximate
- no authentication or access control
- CORS is fully open
- no formal test coverage around the business flow is visible in the current code

Useful future improvements:

- replace mock intent parsing with a real LLM or structured extraction pipeline
- replace mock report synthesis with grounded LLM generation
- improve historical search using embeddings or richer similarity logic
- train a better cost estimator using actual historical project records
- move configuration like API URLs into environment-based settings
- add validation, logging, monitoring, and tests

## 13. Conclusion

This project demonstrates a practical AI-assisted design-change assessment workflow for a manufacturing or shipbuilding setting. Its main value is not just that it accepts natural-language queries, but that it combines graph-based dependency tracing, compliance lookup, historical analogues, and cost estimation into one decision-support pipeline.

The most important technical centerpiece is the backend orchestration in `main.py`, supported by Neo4j graph queries and a simplified PoC intelligence layer. The frontend then turns this analysis into a format that is easier for users to interpret and act on.
