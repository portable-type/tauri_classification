// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command

mod data;
mod dataset;
mod model;
mod predict;
mod training;

use burn::{
    backend::{
        wgpu::{Wgpu, WgpuDevice},
        Autodiff,
    },
    data::dataset::vision::{Annotation, ImageDatasetItem, PixelDepth},
    optim::SgdConfig,
};
use dirs::document_dir;
use model::ModelConfig;
use predict::predict;
use training::{train, TrainingConfig};

#[tauri::command]
fn run_train() {
    train::<Autodiff<Wgpu>>(
        TrainingConfig::new(ModelConfig::new(2, 512), SgdConfig::new()),
        WgpuDevice::default(),
    )
}

#[tauri::command]
fn run_predict() -> String {
    type MyBackend = Wgpu<f32, i32>;
    let image_path = document_dir()
        .unwrap()
        .join("tauri-classification")
        .join("predict.png");
    let img = image::open(image_path).unwrap();
    let item = img.into_rgba8().into_raw();
    let data = ImageDatasetItem {
        image: item.into_iter().map(|data| PixelDepth::U8(data)).collect(),
        annotation: Annotation::Label(0),
    };
    predict::<MyBackend>(WgpuDevice::default(), data)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![run_train, run_predict])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn check_train() {
        train::<Autodiff<Wgpu>>(
            TrainingConfig::new(ModelConfig::new(2, 512), SgdConfig::new()),
            WgpuDevice::default(),
        )
    }
}
