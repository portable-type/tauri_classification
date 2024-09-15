use burn::{
    config::Config,
    data::{dataloader::batcher::Batcher, dataset::vision::ImageDatasetItem},
    module::Module,
    prelude::Backend,
    record::{CompactRecorder, Recorder},
};

use crate::{
    data::ClassificationBatcher,
    model::Cnn,
    training::{TrainingConfig, ARTIFACT_DIR},
};

pub fn predict<B: Backend>(device: B::Device, item: ImageDatasetItem) -> String {
    let config = TrainingConfig::load(format!("{ARTIFACT_DIR}/config.json"))
        .expect("Config should exist for the model; run train first");
    let record = CompactRecorder::new()
        .load(format!("{ARTIFACT_DIR}/model").into(), &device)
        .expect("Trained model should exist; run train first");

    let model: Cnn<B> = config.model.init(&device).load_record(record);

    let batcher = ClassificationBatcher::new(device);
    let batch = batcher.batch(vec![item]);
    let output = model.forward(batch.images);
    let predicted = output.argmax(1).flatten::<1>(0, 1).into_scalar();
    format!("{}", predicted)
}
