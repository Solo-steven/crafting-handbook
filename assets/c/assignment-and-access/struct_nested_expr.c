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
    int a = 100;
    top.value1 = 10 + top.nested.value2;
    top.value2 = 100 + a * 10 * 9;
    top.value1 =  top.nested.value2 + 900;
}