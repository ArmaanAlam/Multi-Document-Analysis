import requests
import streamlit as st

API_URL = "http://127.0.0.1:8000"

st.set_page_config(
    page_title="RAG Assistant",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ---------------- Sidebar ---------------- #

with st.sidebar:
    st.title("RAG")

    st.markdown("---")

    st.markdown("""
### Features

- Upload PDF
- Automatic Embedding
- Vector Database
- Semantic Search
- AI Powered Answers
""")

    st.markdown("---")

    st.info(
        "Upload a PDF, wait for processing, and ask questions naturally."
    )

# ---------------- Main UI ---------------- #

st.title("Report Analysis Assistant")

st.caption(
    "Upload a PDF and ask questions about its contents."
)

tab1, tab2 = st.tabs(["📤 Upload Report", "💬 Ask Questions"])

# =====================================================
# Upload Tab
# =====================================================

with tab1:

    uploaded_file = st.file_uploader(
        "Upload PDF",
        type=["pdf"]
    )

    if uploaded_file:

        st.success(f"Selected: {uploaded_file.name}")

        if st.button(
            "Create Knowledge Base",
            use_container_width=True
        ):

            with st.spinner("Processing PDF..."):

                files = {
                    "file": (
                        uploaded_file.name,
                        uploaded_file.getvalue(),
                        "application/pdf"
                    )
                }

                response = requests.post(
                    f"{API_URL}/upload",
                    files=files
                )

            if response.status_code == 200:

                data = response.json()

                st.success("Knowledge Base Created Successfully!")

                st.json(data)

            else:

                st.error(response.text)

# =====================================================
# Chat Tab
# =====================================================

with tab2:

    question = st.text_area(
        "Ask a Question",
        height=150,
        placeholder="Example: What are the abnormal values in this report?"
    )

    if st.button(
        "Generate Answer",
        use_container_width=True
    ):

        if not question.strip():

            st.warning("Please enter a question.")

        else:

            with st.spinner("Thinking..."):

                response = requests.post(
                    f"{API_URL}/response",
                    json={
                        "question": question
                    }
                )

            if response.status_code == 200:

                answer = response.json()["answer"]

                st.success("Answer Generated")

                st.markdown("### AI Answer")

                st.write(answer)

            else:

                st.error(response.text)