
	// sensores
	const sensorFotocelula = 2
	const sensorUltrasonidoDormitorio= 3
	// actuadores
	const puertoLuz = 4
	const puertoVentilador = 5
	ports[puertoVentilador].write(0)
	// obtener el valor de la lectura
	
	// ultrasonido esta en el puerto 3
	if(ports[sensorUltrasonidoDormitorio]){
		if(ports[puertoVentilador]){
			if( ports[sensorUltrasonidoDormitorio].read() )
				ports[puertoVentilador].write(1)
			else 
				ports[puertoVentilador].write(0)
		}
		if(ports[puertoLuz]){
			if( ports[puertoLuz] )
				ports[puertoLuz].write(1)
			else 
				ports[puertoLuz].write(0)
		}
	}

