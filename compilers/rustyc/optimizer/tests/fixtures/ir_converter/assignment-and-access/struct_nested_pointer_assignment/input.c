int main() {
    struct Nested {
        int value1;
        int value2;
    };
    struct Top {
        int value1;
        int value2;
        struct Nested *nested;
        struct Top *next;
    };
    struct Top top;
    struct Top next;
    struct Nested nested;
    struct Nested next_nested;

    struct Top *p;
    p = &top;

    p->nested = &nested;
    p->next = &next;
    next.nested = &next_nested;

    p->value1 = 10;
    p->value2 = 100;
    p->nested->value1 = 1000;
    top.nested->value2 = 900;
    top.next->value1 = 100;

    p->value1 = top.next->value1 + top.value2;
    
    return 0;
}