## graphify

This project has a graphify knowledge graph at graphify-out/.

Rules:
- ALWAYS read graphify-out/GRAPH_REPORT.md and query graph.json FIRST before doing any blind file reading or searching. If you need structural info (who calls who), read the graph! This saves tokens and avoids hallucinating relationships.
- Do NOT read dozens of source files to understand the system. Rely on the structural graph logic.
- If graphify-out/wiki/index.md exists, navigate it instead of reading raw files.
- If the graphify MCP server is active, utilize tools like `query_graph`, `get_node`, and `shortest_path` for precise architecture navigation instead of falling back to raw searching or guessing.
- After modifying code files in this session, run `graphify update .` to keep the graph current (AST-only, no API cost).
