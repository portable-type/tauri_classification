use std::fs::write;

use burn::{
    nn::{
        conv::{Conv2d, Conv2dConfig},
        pool::{MaxPool2d, MaxPool2dConfig},
        Dropout, DropoutConfig, Linear, LinearConfig, PaddingConfig2d, Relu,
    },
    prelude::*,
};
use dirs::download_dir;

#[derive(Module, Debug)]
pub struct Cnn<B: Backend> {
    activation: Relu,
    dropout: Dropout,
    pool: MaxPool2d,
    conv1: Conv2d<B>,
    conv2: Conv2d<B>,
    conv3: Conv2d<B>,
    conv4: Conv2d<B>,
    conv5: Conv2d<B>,
    conv6: Conv2d<B>,
    fc1: Linear<B>,
    fc2: Linear<B>,
}

#[derive(Config, Debug)]
pub struct ModelConfig {
    num_classes: usize,
    hidden_size: usize,
    #[config(default = "0.5")]
    dropout: f64,
}

impl ModelConfig {
    pub fn init<B: Backend>(&self, device: &B::Device) -> Cnn<B> {
        Cnn {
            activation: Relu::new(),
            dropout: DropoutConfig::new(self.dropout).init(),
            pool: MaxPool2dConfig::new([2, 2]).init(),
            conv1: Conv2dConfig::new([3, 12], [3, 3]).init(device),
            conv2: Conv2dConfig::new([32, 32], [3, 3]).init(device),
            conv3: Conv2dConfig::new([32, 64], [3, 3]).init(device),
            conv4: Conv2dConfig::new([64, 64], [3, 3]).init(device),
            conv5: Conv2dConfig::new([64, 128], [3, 3]).init(device),
            conv6: Conv2dConfig::new([128, 128], [3, 3]).init(device),
            fc1: LinearConfig::new(128 * 4 * 4, self.hidden_size).init(device),
            fc2: LinearConfig::new(self.hidden_size, self.num_classes).init(device),
        }
    }
}

impl<B: Backend> Cnn<B> {
    pub fn forward(&self, x: Tensor<B, 4>) -> Tensor<B, 2> {
        let x = self.conv1.forward(x);
        let x = self.activation.forward(x);
        let x = self.conv2.forward(x);
        let x = self.activation.forward(x);
        let x = self.pool.forward(x);
        let x = self.dropout.forward(x);

        let x = self.conv3.forward(x);
        let x = self.activation.forward(x);
        let x = self.conv4.forward(x);
        let x = self.activation.forward(x);
        let x = self.pool.forward(x);
        let x = self.dropout.forward(x);

        let x = self.conv5.forward(x);
        let x = self.activation.forward(x);
        let x = self.conv6.forward(x);
        let x = self.activation.forward(x);
        let x = self.pool.forward(x);
        let x = self.dropout.forward(x);

        let x = x.flatten(1, 3);

        let x = self.fc1.forward(x);
        let x = self.activation.forward(x);
        let x = self.dropout.forward(x);

        let files = download_dir().unwrap().join("model.txt");
        let _ = write(files, format!("{:?}", x));

        self.fc2.forward(x)
    }
}
