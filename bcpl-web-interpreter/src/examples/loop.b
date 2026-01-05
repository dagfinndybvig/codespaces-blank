GET "LIBHDR"

LET START() BE $(
  WRITES("Counting from 1 to 10:*N")
  FOR I = 1 TO 10 DO $(
    WRITEF("Number %I2*N", I)
  $)
  WRITES("*NDone!*N")
$)
