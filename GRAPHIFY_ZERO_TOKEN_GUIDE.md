# Graphify Zero-Token (AST) Setup Guide 🚀

Yeh guide us developer ya AI Agent ke liye hai jisse ek naye, badhe project par **Graphify** setup karna hai **bina ek bhi API token waste kiye**. Is method se siraf *code architecture, AST (Abstract Syntax Tree) rules, imports, aur function calls* extract honge (Semantic deep dive skip hoga).

---

## Part 1: Initial Setup (For Developer/Agent)

### 1. Hamesha ignore file set karo
Project me jab bhi jao, root directory par ek `.graphifyignore` file banao aur junk avoid karo taaki indexing tez aur accurate ho:
```text
node_modules/
dist/
build/
.next/
vendor/
.gemini/
coverage/
```

### 2. Antigravity Agent Hook (Optional but recommended)
Agar naye PC/system me ho toh agent (Antigravity/Claude/Cursor) ko graphify ka rule sikha do:
```bash
python -m graphifyy antigravity install
```
*(Yeh `.agent/rules` etc. push kar dega)*

---

## Part 2: Zero-Token Graph Extraction (For Agents)

Jab project bhot heavy ho (200+ files), LLM tokens jalane ki jagah **sirf AST extraction** use karo. Graphify command line utility pe `--no-semantic` flag lagta hai, par locally Python hook se ise strictly bypass karne ke liye ye direct script method 100% fail-proof hai:

Agent ko ye step use karke Graph banani hai:

**Step A:** Ek temporary python builder file banao (e.g., `run_graphify_ast.py`):
```python
import sys, json
from pathlib import Path
from graphify.extract import collect_files, extract
from graphify.build import build_from_json
from graphify.cluster import cluster, score_all
from graphify.analyze import god_nodes, surprising_connections, suggest_questions
from graphify.report import generate
from graphify.export import to_json, to_html

out_dir = Path("graphify-out")
out_dir.mkdir(exist_ok=True)

# 1. AST Direct Extraction (Skip LLM Semantic Tooling)
from graphify.detect import detect
detect_res = detect(Path('.'))
(out_dir / ".graphify_detect.json").write_text(json.dumps(detect_res))

code_files = []
for f in detect_res.get("files", {}).get("code", []):
    fp = Path(f)
    if fp.exists():
        code_files.extend(collect_files(fp) if fp.is_dir() else [fp])

ast_res = extract(code_files) if code_files else {"nodes":[], "edges":[], "input_tokens":0, "output_tokens":0}

merged = {
    "nodes": ast_res["nodes"],
    "edges": ast_res["edges"],
    "hyperedges": [],
    "input_tokens": 0, "output_tokens": 0,
}
(out_dir / ".graphify_extract.json").write_text(json.dumps(merged, indent=2))

# 2. Build & Generate
G = build_from_json(merged)
if G.number_of_nodes() == 0:
    print("Graph empty. Check .graphifyignore rules.")
    sys.exit(1)

communities = cluster(G)
cohesion = score_all(G, communities)
gods = god_nodes(G)
surprises = surprising_connections(G, communities)
labels = {cid: f'Community {cid}' for cid in communities}

# 3. Export to JSON, HTML, Markdown
to_json(G, communities, out_dir / "graph.json")
to_html(G, communities, out_dir / "graph.html", community_labels=labels)
report = generate(G, communities, cohesion, labels, gods, surprises, detect_res, {"input":0,"output":0}, str(Path('.').absolute()))
(out_dir / "GRAPH_REPORT.md").write_text(report, encoding="utf-8")

print(f"Zero-Token Graph Completed! {G.number_of_nodes()} Nodes, {G.number_of_edges()} Edges.")
```

**Step B:** Sirf isko run karo aur clean up kar do:
```bash
python run_graphify_ast.py
rm run_graphify_ast.py
```

*(Isse **100% token usage zero** rahega kyunki AST locally tree-sitter logic pe parsing maarta hai bina LLM API call kiye.)*

---

## Part 3: Architecture Navigate Karna (For LLM Agents)

Graph index hone k baad ek nayi `graphify-out` directory aayegi. LLM/Agent ko context ke liye use karna hai is tarah:

### 1. High Level Overview Ke Liye
Seedha Markdown Audit report padhlo, ye saari modules ka blueprint deta h.
```bash
cat graphify-out/GRAPH_REPORT.md
```

### 2. Node/Path Trace Karne Ke Liye (MCP Server)
Agar agent (kisi naye chat thread me) detailed relationship maang raha hai, toh Graphify ko MCP ke through seedha pass kar do:
```bash
uv run --with graphifyy --with mcp -m graphify.serve graphify-out/graph.json
```
*(Cursor/Claude/Antigravity mein agar MCP config `mcp_config.json` mein daali hui hai toh agent aapse "get_node", "get_neighbors" seedha directly extract kar lega json se.)*

### 3. Developer UX (For Human)
Sirf file double click karni hai locally:
* **Interactive UI**: `graphify-out/graph.html`
* **Plain Text Insight**: Khojna ho God classes, bottlenecks toh `GRAPH_REPORT.md`.

---
**Core Rule For Any AI Agent Execution:**
Agar user bole "graphify setup kar project pe", toh seedha pehle `graphifyignore` thok ke, zero-token script bypass chala lena aur summary user k moo pe fek marna (number of nodes and edges). Bina confirm kiye LLM based semantic deepdive flag **kabhi matt lagana** (200 file me hundreds of thousands tokens jal jayenge).

### 🚨 AGENT SURVIVAL RULES (Prompt Addition)
Agent/Developer, jab bhi naye codebase me jao:
1. **Never read 20 source files just to understand "what calls what".** Token barbad mat karo.
2. Sabse pehle `graphify-out/GRAPH_REPORT.md` padho. Isse 20 seconds me pure system ke God Nodes (heavy dependencies) aur Community Structure samajh aa jayenge.
3. Agar codebase ka architect samajhna hai, `graphify-out/graph.json` aur MCP tools (`get_node`, `query_graph`, `shortest_path`) ko call lagao bajaye `grep`/search ke.
4. Token bachenge, context limit explode nahi hogi aur hallucination (tu kuch aur samjhe, code me kuch aur ho) khatam ho jayega! Graph is absolute truth.
