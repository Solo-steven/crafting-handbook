
void (* call_function) ();

void mock() {
    return;
}

int main() {
    call_function = mock;
    call_function();
    mock();
    return 0;
}