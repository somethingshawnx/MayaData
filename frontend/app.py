import streamlit as st
import requests

st.title("🔐 MayaData: Synthetic Data Generator")
st.markdown("Upload your **sensitive CSV**, and we will generate a **mathematically identical fake version**.")

# NOTE: Since we are running locally, we use localhost
API_URL = "http://127.0.0.1:8000"

uploaded_file = st.file_uploader("Choose a CSV file", type="csv")
num_rows = st.slider("How many fake rows do you want?", 100, 500, 100)

if uploaded_file is not None:
    if st.button("Generate Synthetic Data"):
        st.info("The AI is training... This may take a minute. Please wait.")
        
        files = {"file": (uploaded_file.name, uploaded_file.getvalue(), "text/csv")}
        try:
            response = requests.post(f"{API_URL}/generate?rows={num_rows}", files=files)
            
            if response.status_code == 200:
                st.success("Success! Data Generated.")
                st.download_button(
                    label="Download Synthetic CSV",
                    data=response.content,
                    file_name="synthetic_data.csv",
                    mime="text/csv"
                )
            else:
                st.error(f"Server Error: {response.text}")
        except requests.exceptions.ConnectionError:
            st.error("Could not connect to Backend. Is 'main.py' running?")