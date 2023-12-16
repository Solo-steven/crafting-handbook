int main() {
    struct Nested {
        int value1;
        int value2;
    };
    struct Top {
        int value1;
        int value2;
        struct Nested nested;
    };
    struct Top top;

    top.value1 = 10;
    top.value2 = 100;
    top.nested.value1 = 1000;
    top.nested.value2 = 900;
}