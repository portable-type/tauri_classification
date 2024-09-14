// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command

mod data;
mod dataset;
mod model;
mod training;

use burn::{
    backend::{
        wgpu::{Wgpu, WgpuDevice},
        Autodiff,
    },
    optim::{momentum::MomentumConfig, SgdConfig},
};
use training::{train, TrainingConfig};

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn run_train() {
    train::<Autodiff<Wgpu>>(
        TrainingConfig::new(SgdConfig::new().with_momentum(Some(MomentumConfig {
            momentum: 0.9,
            dampening: 0.,
            nesterov: false,
        }))),
        WgpuDevice::default(),
    )
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
            TrainingConfig::new(SgdConfig::new().with_momentum(Some(MomentumConfig {
                momentum: 0.9,
                dampening: 0.,
                nesterov: false,
            }))),
            WgpuDevice::default(),
        )
    }
}
