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
    struct TopPointer {
        int value1;
        int value2;
        struct Nested *nested;
    };
    struct Top top;
    struct TopPointer top_pointer;
    struct Top *p1 = &top;
    struct Top *p2 = &top_pointer;

    top.value1;
    top.value2;
    top.nested.value1;
    top.nested.value2;
    top_pointer.nested->value1;
    top_pointer.nested->value2;
    p1->nested.value1;
    p2->nested.value2;
}