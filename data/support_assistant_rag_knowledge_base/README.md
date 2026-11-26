# Synthetic RAG Knowledge Pack
This pack contains fictional Markdown documents for the C2 Support Assistant assessment.

## Recommended use
1. Load Markdown documents.
2. Split by headings/sections, preserving table context.
3. Add metadata: `source`, `document_type`, `version`, `synthetic`.
4. Generate embeddings and store chunks in Chroma, FAISS or another vector store.
5. Retrieve relevant chunks for policy/how-to questions and cite source documents in answers.
6. Abstain when retrieved context is insufficient.

## Important separation
Use these static documents for RAG: policies, guides, FAQs and product descriptions.
Keep live tickets, comments, users, assignments and current statuses in the application database. Retrieve those through authorized APIs/MCP tools, not by embedding the live database into the vector store.

All policies, SLA values and product names are fictional assessment examples. Use synthetic data only. Do not send company/client/customer confidential data to public or free LLM services.
