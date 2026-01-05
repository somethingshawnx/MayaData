import pandas as pd
from sdv.single_table import CTGANSynthesizer
from sdv.metadata import SingleTableMetadata

def generate_synthetic_data(real_csv_path, num_rows=100):
    real_data = pd.read_csv(real_csv_path)
    
    metadata = SingleTableMetadata()
    metadata.detect_from_dataframe(data=real_data)
    
    # verbose=True shows the training progress in the terminal
    synthesizer = CTGANSynthesizer(metadata, verbose=True)
    synthesizer.fit(real_data)
    
    synthetic_data = synthesizer.sample(num_rows=num_rows)
    return synthetic_data.to_csv(index=False)