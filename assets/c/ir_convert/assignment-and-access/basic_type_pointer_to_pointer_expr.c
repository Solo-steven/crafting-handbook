int main() {
    int base;
    int *p = &base;
    int **pp = &p;
    int g = 10;
    **pp + 10;
    **pp + g;
    **pp = *p + 10;
    **pp = **pp + g;
}