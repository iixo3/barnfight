pub fn round_to_decimal_places(value: f32, decimal_places: u32) -> f32 {
    let multiplier = 10f32.powi(decimal_places as i32);
    (value * multiplier).round() / multiplier
}
