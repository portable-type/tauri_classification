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
    prelude::Backend,
};
use model::ModelConfig;
use predict::predict;
use training::{train, TrainingConfig};

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn run_train() {
    train::<Autodiff<Wgpu>>(
        TrainingConfig::new(ModelConfig::new(2, 512), SgdConfig::new()),
        WgpuDevice::default(),
    )
}

#[tauri::command]
fn run_predict(item: Vec<u8>) -> String {
    type MyBackend = Wgpu<f32, i32>;
    let data = ImageDatasetItem {
        image: item.into_iter().map(PixelDepth::U8).collect(),
        annotation: Annotation::Label(0),
    };
    predict::<MyBackend>(WgpuDevice::default(), data)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![greet, run_train])
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
