use burn::{
    data::{
        dataloader::batcher::Batcher,
        dataset::vision::{Annotation, ImageDatasetItem, PixelDepth},
    },
    prelude::*,
};

use image::{imageops, ImageBuffer, Rgb, Rgba, RgbaImage};

const MEAN: [f32; 3] = [0.4914, 0.48216, 0.44653];
const STD: [f32; 3] = [0.24703, 0.24349, 0.26159];

#[derive(Clone)]
pub struct Normalizer<B: Backend> {
    pub mean: Tensor<B, 4>,
    pub std: Tensor<B, 4>,
}

impl<B: Backend> Normalizer<B> {
    pub fn new(device: &Device<B>) -> Self {
        let mean = Tensor::<B, 1>::from_floats(MEAN, device).reshape([1, 3, 1, 1]);
        let std = Tensor::<B, 1>::from_floats(STD, device).reshape([1, 3, 1, 1]);
        Self { mean, std }
    }

    pub fn normalize(&self, input: Tensor<B, 4>) -> Tensor<B, 4> {
        (input - self.mean.clone()) / self.std.clone()
    }
}

#[derive(Clone)]
pub struct ClassificationBatcher<B: Backend> {
    normalizer: Normalizer<B>,
    device: B::Device,
}

#[derive(Clone, Debug)]
pub struct ClassificationBatch<B: Backend> {
    pub images: Tensor<B, 4>,
    pub targets: Tensor<B, 1, Int>,
}

impl<B: Backend> ClassificationBatcher<B> {
    pub fn new(device: B::Device) -> Self {
        Self {
            normalizer: Normalizer::<B>::new(&device),
            device,
        }
    }
}

impl<B: Backend> Batcher<ImageDatasetItem, ClassificationBatch<B>> for ClassificationBatcher<B> {
    fn batch(&self, items: Vec<ImageDatasetItem>) -> ClassificationBatch<B> {
        fn image_as_vec_u8(item: ImageDatasetItem) -> Vec<u8> {
            item.image
                .into_iter()
                .map(|p: PixelDepth| -> u8 { p.try_into().unwrap() })
                .collect::<Vec<u8>>()
        }

        fn vec_to_rgba_image(pixel_data: Vec<u8>, width: u32, height: u32) -> RgbaImage {
            ImageBuffer::from_raw(width, height, pixel_data).unwrap()
        }

        fn resize_image(input: RgbaImage) -> ImageBuffer<Rgba<u8>, Vec<u8>> {
            imageops::resize(&input, 32, 32, imageops::FilterType::Lanczos3)
        }

        fn add_chennnels(resized: &RgbaImage) -> Vec<u8> {
            let mut new_image = ImageBuffer::new(32, 32);
            for (x, y, pixel) in resized.enumerate_pixels() {
                let r = pixel[0];
                let g = pixel[1];
                let b = pixel[2];

                new_image.put_pixel(x, y, Rgb([r, g, b]));
            }

            new_image.into_raw()
        }
        let targets = items
            .iter()
            .map(|item| {
                // Expect class label (int) as target
                if let Annotation::Label(y) = item.annotation {
                    Tensor::<B, 1, Int>::from_data(
                        TensorData::from([(y as i64).elem::<B::IntElem>()]),
                        &self.device,
                    )
                } else {
                    panic!("Invalid target type")
                }
            })
            .collect();

        let images = items
            .into_iter()
            .map(|item| image_as_vec_u8(item))
            .map(|item| vec_to_rgba_image(item, 720, 720))
            .map(|item| resize_image(item))
            .map(|item| add_chennnels(&item))
            .map(|item| TensorData::new(item, Shape::new([32, 32, 3])))
            .map(|data| {
                Tensor::<B, 3>::from_data(data.convert::<B::FloatElem>(), &self.device)
                    .swap_dims(2, 1)
                    .swap_dims(1, 0)
            })
            .map(|tensor: Tensor<B, 3>| tensor / 255)
            .collect();

        let images = Tensor::stack(images, 0);
        let targets = Tensor::cat(targets, 0);
        let images = self.normalizer.normalize(images);

        ClassificationBatch { images, targets }
    }
}
