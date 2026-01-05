GET "LIBHDR"

GLOBAL $(
  A: 200;
  B: 201
$)

LET START() BE $(
  WRITES("Fibonacci sequence (first 15 numbers):*N")
  A := 0
  B := 1
  
  WRITEF("%I5", A)
  WRITEF("%I5", B)
  
  FOR I = 3 TO 15 DO $(
    LET C = A + B
    WRITEF("%I5", C)
    A := B
    B := C
  $)
  
  WRITES("*N")
$)
