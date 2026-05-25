<?php

/* ################################################################# Requerimientos actuales
    # en verifica-datos-layout.php falta cerrar el html
    # implementar los nuevos log en layout
    # modificar nombre de archivos "pedido-abm-*" por "abm-pedido-*" o "abm-pedidos-*"
    # mover los archivos de abm pedidos a una carpeta exclusiva para eso (abm-pedidos)
    # revisar ABM pedidos si se puede optimizar más

    # HACER - PENDIENTE USUARIO - Re: Fwd: Fwd: Fwd: [DEV] (REQ) 1 - ADM VENTAS - EDICIÓN DE PEDIDOS DESDE SGI - devolución 07/05 { # rama: edicion-pedidos-2
        # HACER - correcciones: {
            separar Logs ya que se usan en PedidoTango y deben estar en un controlador
            la tabla pedidos de SGI usa n_renglon, talon, pedido y cliente como clave, adaptar cambios. {}
            procesar los datos $_POST (validaciones, escapar texto, etc) {}
            revisar mensajes de try-catch
            
            medir tiempos de procesos: (no sumado) {
                nuevo panel JS que se muestra con localstorage varieble dev=true
                inicio: 17-05-2026 23:32
                fin: 18-05-2026 00:18
                horas: 46min
            }

            pedido-abm-encabezado.php: manejo de errores, variables indefinidas y validaciones (sumado) {
                inicio: 19-05-2026 14:30
                fin: 19-05-2026 14:59
                horas: 29min
            }

            correcciones abm (sumado) {
                relacionar todos los campos que se utilizan en PedidoTango.php con nuevo controlador (sumado) {
                    Revise que campos usa cada get...() de PedidoTango.
                    Arme el mapeo de esos campos al nuevo PedidoController.
                    Ordene campos repetidos (header) para no duplicar lógica.
                    Ajuste nombres de claves para que coincidan en todas las pantallas.
                    Probe que siga funcionando en ABM sin romper lo existente.

                    inicio: 19-05-2026 17:03
                    fin: 19-05-2026 18:47
                    horas: 1hr 44min
                }

                modificacion de PedidoSgi y pedido-abm-*.php para usar la nueva estructura de datos y el nuevo controlador (sumado) {
                    Actualice PedidoSgi para que trabaje con la nueva estructura de datos.
                    Ajuste pedido-abm-*.php para leer y mostrar datos desde el controlador.
                    Reemplace accesos viejos de arrays por las nuevas claves unificadas.
                    Corregí validaciones y casos donde faltaban datos en el flujo.
                    Adapte alta/edición para que no se rompa al cambiar la fuente de datos.
                    Hice pruebas en ABM (encabezado, renglones, resumen e info adicional).

                    inicio: 19-05-2026 18:50
                    fin: 19-05-2026 19:56
                    horas: 1hr 6min

                    inicio: 19-05-2026 20:00
                    fin: 19-05-2026 20:30
                    horas: 30min

                    inicio: 19-05-2026 20:40
                    fin: 19-05-2026 21:30
                    horas: 50min

                    inicio: 19-05-2026 22:00
                    fin: 19-05-2026 23:20
                    horas: 1hr 20min
                }

                pedido-abm-encabezado.php: (sumado) {
                    manejo de error de los distintos tipos de informacion (tango, pif, pedidos, pedidos_art, etc)
                    panel de visualizacion cuando no hay datos o informacion

                    inicio: 19-05-2026 23:50
                    fin: 20-05-2026 00:30
                    horas: 40min
                }
            }
        }

        # HACER - Hacer lo mismo para NUEVO PEDIDO pero en lugar de vincular de una OPORTUNIDAD, vincular de un PIF {
            https://sgi.sotic.com.ar/sotic/verifica-datos-pif.php?idpif=826

            panel visual para buscar y ver datos PIF (pedido-abm-nuevo.php) (sumado) {
                Agregue búsqueda por IDPIF en nuevo pedido.
                Incorpore método para traer datos del PIF y mostrarlos en pantalla.
                Arme panel visual para previsualizar datos principales del PIF.
                Ajuste comportamiento de botones según tipo de búsqueda (OP o PIF).
                Deje comentado “continuar pedido” cuando viene por PIF (pendiente backend).
                Probe flujo de búsqueda y carga visual para evitar romper el modo OPORTUNIDAD.

                agregado de idpif y metodo para buscar datos PIF
                agregado visualizador de datos PIF para NUEVO PEDIDO
                comentar boton continuar pedido si se busca PIF (no desarrollado en backend)

                inicio: 19-05-2026 15:00
                fin: 19-05-2026 17:00
                horas: 2hr
            }

            HACER - implementacion del backend con datos PIF (no sumado) {
                inicio: 
                fin: 
                horas: 
            }
        }

        # HACER - Opción de generar una NV sin vincularla ni a PIF ni a OPORTUNIDAD. Sería un caso excepcional pero entiendo que puede ser necesario. {
            # inicio: 
            # fin: 
            # horas: 
        }

        # LISTO - Vas avanzando con las tablas con la información del pedido en SGI? {
            SQL insert pedidos sgi (sumado) {
                revision de campos necesarios, claves, preparacion de las consultas SQL
                # inicio: 15-05-2026 18:20
                # fin: 15-05-2026 19:20
                # horas: 1hr
            }

            separar PedidoSgi de PedidoTango (procesarCambiosLineas, createLinea, updateLinea, deleteLinea) (sumado) {
                Modificar lógica en los métodos de PedidoTango para separar de PedidoSgi. (sumado) {
                    inicio: 15-05-2026 19:56
                    fin: 15-05-2026 20:56 (listo createLinea)
                    horas: 1hr

                    inicio: 16-05-2026 00:05
                    pausa: 16-05-2026 01:05
                    horas: 1hr (listo en PedidoTango, falta implementar procesarCambiosLineas en PedidoSgi)
                }

                Modificar lógica en los métodos de PedidoSgi y creación de nuevos métodos (sumado) {
                    inicio retomo: 16-05-2026 22:30
                    fin: 16-05-2026 23:30
                    horas: 1hr (listo SGI updateLinea, falta revisar createLinea, deleteLinea que se invocan en procesarCambiosLineas)
    
                    inicio: 17-05-2026 18:10
                    fin: 17-05-2026 19:10
                    horas: 1hr (listo SGI createLinea, deleteLinea y pantalla para ver datos de SGI)
    
                    inicio: 17-05-2026 21:30
                    fin: 17-05-2026 22:30
                    horas: 1hr (listo tema precios de que PedidoTango consulta listas de precio y PedidoSgi no.)
                }

                LISTO - PedidoSgi.php: createLineasDesdeOportunidad (sumado) {
                    metodo para crear las lineas del pedido en base a la OP luego de haber pasado e insertado en Tango.
                    inicio: 17-05-2026 20:30
                    fin: 17-05-2026 21:25
                    horas: 55min
                }
            }

            LISTO - Podes armar una consulta para ver una vista de esas tablas? (sumado) {
                consulta sql {
                    inicio: 17-05-2026 19:15
                    fin: 17-05-2026 19:30
                    horas: 15min
                }

                Modificacion para agregar un panel que muestre los 10 ultimos pedidos y poder ver sus datos (sumado) {
                    inicio: 17-05-2026 23:15
                    fin: 17-05-2026 23:30
                    horas: 15min
                }
            }
        }

        1 - CONSULTAR (listo la consulta) – En el campo “bonificación” debería tomar el porcentaje de la oportunidad, si es 0% debería figurar tal cual {
            los datos estan en tabla condvta asociada al campo nro-id a la op
            pedir algunos pedidos con dto de ejemplo para ver de que campo toma el dto en Tango
            consultar si ese dto tiene que ver con la bonificacion en cada linea del pedido
        }

        2 - CONSULTAR (listo la consulta) - El vendedor lo debería traer por defecto de la oportunidad, y se debe poder modificar al mismo tiempo {
            OP ejemplo: 27881
            No tiene campo 'cod' asociado en tabla user, ese campo se usa para vincular a Tango
            De hecho ese vendedor (Vogel, Maximiliano) no existe en la tabla GVA23 de tango
        }

        3 - LISTO - CONSULTAR (listo la consulta) - El campo cotización debería tomar el de tango, que se actualiza diariamente (sumado) {
            De donde debe tomar en Tango?
            Pedir ejemplos de pedidos con cotización para ver de donde lo toma en Tango
            
            ahora toma el precio del dolar de SGI (sumado) {
                inicio: 07-05-2026 20:30
                fin: 07-05-2026 20:45
                horas: 15min
            }
        }

        4 – LISTO - El campo con el numero de remito no lo utilizamos nunca, se puede eliminar (NO ES OBLIGATORIO) (sumado) {
            inicio: 07-05-2026 20:40
            fin: 07-05-2026 20:45
            horas: 5min
        }

        5 - CONSULTAR (listo la consulta) - El campo de “talonario para factura” debería ser editable {
            Ver de que tabla toma los talonarios para factura de Tango
            Pedir captura con los diferentas talonarios
        }

        6 - LISTO - El campo “nro. de orden de compra” figura como obligatorio, debería no serlo, porque no siempre tenemos un numero asociado. (sumado) {
            quitar * rojo requerido {
                inicio: 07-05-2026 20:47
                fin: 07-05-2026 20:49
                horas: 2min
            }
        }

        7 - LISTO - El campo sucursal de destino debería quedar fijo y ser siempre santa fe, las otras ya no se utilizan y quedaron obsoletas.
        8 – LISTO - El campo sucursal de origen ídem al anterior (sumado) {
            Remover SQL para consultar sucursales y dejar solo SANTA FE.
            En nuevo pedido debe ingresar siempre SANTA FE como sucursal de origen y destino, y no dejar modificarlo.
            En editar pedido debe traer lo guardado en Tango y no dejar editar.

            inicio: 07-05-2026 20:53
            fin: 07-05-2026 22:23
            horas: 1hr 30min
        }

        9 - LISTO - Cuando se agrega un articulo en que moneda lo carga ¿? Estimo que lo está tomando en pesos, pero en la total figura en dólares. (sumado) {
            inicio: 11-05-2026 19:57
            fin: 11-05-2026 20:57
            horas: 1hr
            se hicieron los metodos para que guarde la moneda correcta segun la seleccionada en el encabezado
        }

        10 - LISTO - No debe dejar modificar la descripción adicional de un artículo, ya que tienen códigos asignados (formulas) y si, por ejemplo, le borramos el color (como en la captura) puede ocurrir un error grave. (sumado) {
            inicio: 07-05-2026 22:10
            fin: 07-05-2026 22:25
            horas: 15min
        }

        11 - LISTO - Las pestañas marcadas en amarillo no son visibles, y tampoco las utilizamos en la “diaria“ (sumado) {
            comentar la navegacion {
                inicio: 08-05-2026 20:13
                fin: 08-05-2026 20:15
                horas: 2min
            }
        }

        12 - CONSULTAR (listo la consulta) - Cuando se consulta el pedido en tango se ingresa como aprobado, remitido y facturado. Los pedidos talonario 91 deben insertarse en tango en estado “aprobado” y los pedidos talonario 107 deben insertarse en estado “ingresado”. {
            Ver un ejemplo de cada uno para ver cual es el estado ya que se basa en numero de estado.
        }

        13 - CONSULTAR (listo la consulta) - IMPORTANTE: De una OPORTUNIDAD se pueden generar varias NOTAS DE VENTA, cada una con ciertos artículos de la oportunidad {
            Actualmente el INSERT permite ir asignando artículos a distintas NV.
            Notar por ejemplo la OP 27655 como se desagrega en 6 Notas de Venta, algunas 91 y otras 107.
    
            A medida que se carga un articulo a un pedido, el mismo deja de estar disponible para cargar en otro (para evitar duplicar articulos).
            Salvo los items que marco debajo en VERDE, que se pueden poner en más de un pedido:

            Puede ser un checklist en "nuevo pedido" para seleccionar los art a agregar
        }
    }

    # EN DEV - PENDIENTE USUARIO - [DEV] PRESUPUESTADOR / COTIZADOR - Mejoras solicitadas por VENTAS - capacitacion 6/5 { # rama: feature/mejoras-presupuestador
        # LISTO - punto 1 (sumado 42+20min = 62min = 1hr 2min) {
            1) Flete:  Asegurar que el descuento no aplique sobre el costo del flete.
            acomodar codigo (sumado) {
                inicio: 06-05-2026 19:03
                fin: 06-05-2026 19:45
                horas: 42min
            }

            requerimiento (sumado) {
                inicio: 06-05-2026 20:35
                fin: 06-05-2026 20:55
                horas: 20min
            }
        }

        # LISTO - punto 2 (sumado 55min) {
            2) DESCUENTO
                - Descuento: Eliminar la visualización del descuento en el presupuesto final. Evitar que el cliente vea el porcentaje descontado.
                - Descuento: Ajustar la impresión para que el precio unitario ya muestre el descuento aplicado. Esto permite ocultar la cifra total descontada.
            
            requerimiento (sumado) {
                inicio: 13-05-2026 20:15
                fin: 13-05-2026 21:10
                horas: 55min
            }
        }

        # LISTO - punto 3 (sumado 16+37+22+75+18min = 168min = 2hr 48min) {
            3) Divisa: Implementar funcionalidad de recargo para dólar divisa. Permitir ingresar manualmente el porcentaje de recargo al seleccionar esta moneda.

            corregir SELECT *, parametros SQL a SQL Bind (presu-condicion-venta.php) (sumado) {
                inicio: 18-05-2026 17:10
                fin: 18-05-2026 17:26
                horas: 16min
            }

            requerimiento (sumado) {
                input recargo divisa para el porcentaje
                nuevo campo en la tabla presu
                integracion del nuevo campo de la tabla con el input y sincronizacion de datos

                inicio: 18-05-2026 17:26
                fin: 18-05-2026 18:03
                horas: 37min
            }

            corregir SELECT *, parametros SQL a SQL Bind (verifica-datos-presu.php) (sumado) {
                inicio: 18-05-2026 18:03
                fin: 18-05-2026 18:25
                horas: 22min
            }

            Al implementar la funcionalidad se ve la necesidad de mostrarlo en el apartado de items (verifica-datos-presu.php) (sumado) {
                agregado visual de RECARGO DIVISA en INFORMACION y tambien en la tabla junto a los articulos, flete y descuentos
                aplicar calculo de recargo divisa al subtotal con descuento+flete para mostrar el total final con recargo incluido
                modificaciones visuales para ver los distintos descuentos/recargos y subtotales (total de art, total de art con dto, total de art con dto aplicado + flete + recargo divisa)

                inicio: 18-05-2026 18:25
                fin: 18-05-2026 19:40
                horas: 1hr 15min
            }

            faltaba sumar el subtotal y el recargo de divisa al PDF (sumado) {
                inicio: 18-05-2026 20:37
                fin: 18-05-2026 20:55
                horas: 18min
            }
        }

        # LISTO - punto 4 (sumado 46min) {
            4) Dibujo : Revisar y modificar el diseño del presupuesto enviado. Incluir la firma del comercial y unificar el membrete con la identidad visual de SOTIC.
            agregado de logo sotic y datos de contacto junto al presupuesto en el PDF.
            agregado de datos del vendedor en el footer.

            requerimiento (sumado) {
                inicio: 18-05-2026 19:50
                fin: 18-05-2026 20:36
                horas: 46min
            }
        }

        # HACER - punto 5 (no sumado) {
            Presupuestador - Botón Ganado: Evaluar la adición de un botón para marcar un presupuesto como Ganado. Esta función debe operar sin requerir el envío por correo electrónico previo.
            Presupuestados - boton ganado sin que envie el PDF por  correo - NO.
            NO - Pasar a GANADO sin enviar el presupuesto por correo.
            inicio: 21-05-2026 17:50
            fin: 21-05-2026 18:05
            horas: 15min
        }

        # HACER - punto 6 (no sumado) {
            Revisar Condición Pago: Revisar si existe condición 30 días fecha factura. Evaluar agregar esta condición de pago si es necesario.
        }

        REVISAR - 7) OP Descuento: no llevo el descuento del presupuesto a la oportunidad (sumado) {
            Relacionar la OP con el presupuesto
            NOTA: El presupuesto puede generar una OP luego de enviarlo y pasarlo a estado GANADO.
            
            presu-b.php: modificacion para que abra el presupuesto en nueva ventana en vez de la actual
            verifica-datos-presu.php: se pasa el descuento como parametro a oportunidad-a.php
            oportunidad-a.php: recebir y declarar variable descuento que viene por REQUEST + nuevo input hidden descuento

            REVISAR: ya guarda el descuento en tabla oportunidad pero en verifica-datos.php parece que no hace el calculo {}

            inicio: 20-05-2026 18:01
            fin: 20-05-2026 19:21
            horas: 1hr 20min
        }

        LISTO - 8) Comentario NP: no sale (sumado) {
            Relacionar la OP con el presupuesto
            Campo oportunidad.textonp
            Ver de donde saca (como se completa) el comentario "textonp" de la tabla oportunidad campo "textonp"
            presu-print-pdf.php: el comentario del vendedor no estaba definido (textonp), se genero uno nuevo en base a los comentarios de la oportunidad (que debe estar generada, presu ganado)

            inicio: 20-05-2026 19:22
            fin: 20-05-2026 20:20
            horas: 58min
        }

        # 20-05-2026 devolucion mejoras presupuestador (sumado 40+60+80+58min = 238min = 3hr 58min) {
            LISTO - 1) al agregar articulos los situa abajo y no le aplica los descuentos PERO en el PDF si lo aplica de forma individual y se ve correctamente. (sumado) {
                inicio: 20-05-2026 14:30
                fin: 20-05-2026 15:10
                horas: 40min
            }

            REVISAR - 4) corregir firma (sumado) {
                DomPDF no reconoce el formato del campo "firma" ya que este está en HTML
                Se hizo firma con datos del vendedor de la tabla user

                REVISAR: En local se ve bien, pero en DEV se muestra info de sotic bajo la firma en el PDF. (arreglar)

                inicio: 20-05-2026 17:00
                fin: 20-05-2026 18:00
                horas: 1hr
            }
        }
    }

    # EN DEV - PENDIENTE USUARIO - [DEV] (RE) - 19 - PEDIDOS / PEDIDOS - Nuevos campos y filtros { # rama: feature/ventas-campos-pedidos
        # inicio: 04-05-2026 18:30
        # fin: 04-05-2026 20:00 (+1hr del 5/5/2026 por ajustes e implementacion de filtro vendedor en PIF)
        # horas: 1hr 30min +1hr = 2hr 30min

        parte 2 (wsp): Cuando el PERFIL q entra es distinto de vendedor:
        - Por defecto mostrar TODOS los vendedores (queda seleccionado Pautasso pero te muestra todos).
        - Permitir q si se filtra especificamente un vendedor, se pueda buscar los pedidos de ese vendedor
        - Para el caso de los PIFs, mostrar en VENDEDOR "PIF". Q se pueda filtrar también "VENDEDOR PIF" para buscar todos los PIFs
    }

    # EN DEV - PENDIENTE USUARIO - [DEV] Fwd: Fwd: Capacitación - Ventas - SGI - Uso - ACCESO A VISOR DE PLANOS { # rama: feature/visor-plano-vendedores
        inicio: 04-05-2026 16:41
        fin: 04-05-2026 17:39
        horas: 58min

        Se necesita que todos los usuarios del PERFIL VENTAS (2) NO TENGAS ACCESO AL MÓDULO VISOR DE PLANOS (dentro de PEDIDOS) a excepción de: RAMIRO T - MARIANA D - GERMÁN G.
        REVISAR: Si bien ya no se muestra el boton en el menú, pueden acceder vía URL. Probar en dev.
    }

    # EN LOCAL - Crear dashboard.php de procesos para ver JSON { # rama: feature/procesos/dashboard
        # inicio: 04-05-2026 20:00
        # fin: 04-05-2026 20:30
        # horas: 30min

        crear un dashboard.php que muestre el estado de los procesos en base a los archivos JSON que se generan en monitor.php
        json ejemplo: {
            "proceso": "procesa-art-rapido",
            "inicio": "2026-04-21 10:15:01",
            "fin": "2026-04-21 10:15:03",
            "duracion": 2.14,
            "estado": "ok"
        }
        en monitor.php los $data estan desalineados
    }

    # Para que de $1.200.000 se hace 1hr = $15.000 * 80hr mensuales
    # 80hr mensuales / 30 dias = 2.66hr por dia (de lunes a domingo, feriados, vacaciones, etc)
    # Horas totales: 11hr 25min

    mayo tiene 4 semanas y 3 dias, hoy 2026-05-14 y voy 10h 06m trabajado en 14 días.
    80h / 4 semanas = 20h por semana, 20h / 7 dias = 2.85h por dia, 2.85h * 14 dias = 39.9h.
    entonces debería haber trabajado 39.9h en estos 14 días, pero solo trabajé 10h 06m
    entonces me faltan 29.84h para completar las 80h del mes.
*/

/* ################################################################# Requerimientos listos
    # LISTO EN PROD - [DEV] (REQ) - 28 - STOCKS - No se muestra LOTE ORIGEN { # rama: feature/dep-saldo-lote-origen
        inicio: 06-05-2026 18:32
        fin: 06-05-2026 19:23
        horas: 51min
        
        La consulta SALDOS-LOTE "nueva" no muestra el LOTE ORIGEN, a pesar de q está el filtro para eso. Se necesita contar con ese campo visible. Se puede agregar? Gracias
        Corregir la DESCARGA COMPLETA del excel porque solo trae headers sin datos (por wsp)
    }

    # LISTO EN PROD - [DEV] (REQ) 27 - GESTIÓN DE STOCKS - Error DEPÓSITO 0 { # rama: fix/saldos-deposito-0
        inicio: 05-05-2026 12:00
        fin: 05-05-2026 15:07
        horas: 3hr 7min
    }

    # LISTO EN PROD - [DEV] Re: (RE) - 19 - PEDIDOS / PEDIDOS - Nuevos campos y filtros - Agregado PLAN DESPACHO { # rama: feature/plan-despacho-filtros
        inicio: 06-05-2026 18:15
        fin: 06-05-2026 18:30
        horas: 15min

        La CONSULTA PLAN DESPACHO cuando ingresa un PERFIL VENDEDOR (distinto a Mariana - Ramiro) solo mostrar los pedidos asociados a dicho vendedor (igual que lo que se hizo en PEDIDOS pero en PLAN DESPACHO)
    }

    # LISTO EN PROD - [DEV] (REQ) - Oportunidades de LISTA- Quitar botón LISTA ESPECIAL - Agregar botón para acceder a LISTADO COMPLETO DE ITEMS (sin precio) { # rama: feature/op-lista-botones
        inicio: 05-05-2026 16:02
        fin: 05-05-2026 17:57
        horas: 1hr 55min

        Para OPORTUNIDADES DE LISTA en ESTADO 22
        1- Quitar botón "LISTA ESPECIAL" de las oportunidades. 
        A modo informativo, indicar si esa tabla es una tabla fija de ARTÍCULOS o una tabla dinámica que se va ampliando.

        2- Agregar el botón "LISTADO COMPLETO DE ARTICULOS"
        (Es el que actualmente está en los PIFs, hay que agregarlo también en OP de LISTA en ESTADO 22)
        En la ventana emergente agregar leyenda en color rojo: "Ingrese el código del item especial, validando el mismo a través de un plano."

        En el módulo de Oportunidades, en la sección de LISTA, eliminar el botón "LISTA ESPECIAL" y agregar un nuevo botón que diga "LISTADO COMPLETO DE ITEMS".
        Este nuevo botón debe redirigir a una página que muestre un listado completo de todos los items disponibles, sin mostrar los precios.
        La idea es que este listado sea utilizado para consultas rápidas sin necesidad de mostrar información sensible como los precios.
    }
*/

/* ################################################################# { ABM Pedidos
    revisar: input required cliente
    hacer: insert de nuevo pedido en tablas de sgi
    revisar: ver si usar el contador de sgi o hacer un max() en tango
    agregar: impresión (con encabezado, líneas, etc)
    hacer: manejar todo por IDS (GVA21, GVA03) (esto requiere modificar el objeto completo)
    ver si actualizarTotalPedido debe ser void o retornar algo (y cuando se ejecuta)
    revisar: el log ya consulta el usuario de $_SESSION, ver si en el abm es necesario consultar de nuevo
    ver si variable $ingresar se usa
    ver si en logs guardar solo cambios y no todo el payload
    ver log de actualizar desc_adic - guardado de logs en bucle de update desc_adic,
    ver si en actualizar desc_adic cachear el articulo
    ver si no insertar todas las líneas del pedido en bucle sino todo junto
    pedido-abm-encabezado: agregar try-catch con getOportunidadData($idop)
    deshabilitar botones submit al confirmar los cambios

    hacer una función para validar art en tango que haga getArticulo() y getPrecioArticulo()
    recalcularTotalPedido() es consulta a bd y se puede evitar con un contador local

    ### revisar estos metodos:
    getPrecioArticulo(): consulta bd
    getArticulo(): consulta bd

    $this->pedido_sgi->updateArtxx()

    actualizarTotalPedido(): 
    recalcularTotalPedido(): 

    validarPorcentaje(): 
}

*/
?>
