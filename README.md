Lstvis - LST File Visualization
===============================

Visualize objdump's .lst / .lss files to understand the size of compiled code. 

Lstvis analyzes sections and symbols referenced in objdump's output and compiles 
those information into an ordered list of graphs including source code, 
assembly code and raw binary data.

Howto use
---------

GCC your code with **debug symbols** to include source code infomation in the analysis.

    gcc -g ...

Process you ELF file with **objdump** to get a .lst file.

    objdump -h -S my.elf > my.lst

Go to http://files.rtti.de/lstvis/, paste the **.lst's contents** into the textbox and **click 'Analyze'**.

You can also use Lstvis locally on your machine, just checkout this repository and open index.html.

**Have fun!**

Screenshot
----------
![Image](https://raw.github.com/rti/lstvis/master/example.png)
