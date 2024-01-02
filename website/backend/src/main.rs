use rocket::{launch, routes, get};

#[get("/hello")]
fn hello() -> &'static str {
    "hello string"
}

#[launch]
fn start() -> _ {
    rocket::build().mount("/", routes![hello])
}

