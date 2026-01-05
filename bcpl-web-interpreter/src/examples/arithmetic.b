GET "LIBHDR"

GLOBAL $(
  SUM: 200;
  PRODUCT: 201
$)

LET START() BE $(
  WRITES("=== BCPL Arithmetic Demo ===*N*N")
  
  // Initialize variables
  SUM := 0
  PRODUCT := 1
  
  WRITES("Computing sum and product of 1 to 10:*N*N")
  
  FOR I = 1 TO 10 DO $(
    SUM := SUM + I
    PRODUCT := PRODUCT * I
    WRITEF("After %I2: Sum = %I5, Product = %I10*N", I, SUM, PRODUCT)
  $)
  
  WRITES("*N")
  WRITES("=== Final Results ===*N")
  WRITEF("Total Sum:     %I5*N", SUM)
  WRITEF("Total Product: %I10*N", PRODUCT)
  WRITES("*N=== Demo Complete ===*N")
$)
