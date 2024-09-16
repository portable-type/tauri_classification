use dirs::document_dir;

use burn::data::dataset::vision::ImageFolderDataset;

pub trait DataSets {
    fn dataset_train() -> Self;
    fn dataset_test() -> Self;
}

impl DataSets for ImageFolderDataset {
    fn dataset_train() -> Self {
        let root = document_dir().unwrap().join("tauri-classification");
        Self::new_classification(root.join("train")).unwrap()
    }

    fn dataset_test() -> Self {
        let root = document_dir().unwrap().join("tauri-classification");
        Self::new_classification(root.join("test")).unwrap()
    }
}
