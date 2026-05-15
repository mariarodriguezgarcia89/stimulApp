export const mensajes = {
  // --- REGISTRO ---
  nombreObligatorio: 'Por favor, escriba su nombre para que sepamos cómo llamarle.',
  apellidosObligatorios: 'Por favor, escriba sus apellidos para completar su perfil.',
  emailObligatorio: 'Necesitamos su correo electrónico para crear su cuenta.',
  emailInvalido: 'El correo no parece estar bien escrito. Asegúrese de que incluye una "@" (arroba) y termina en algo como .com o .es.',
  passwordObligatoria: 'Es necesario que elija una contraseña para proteger su cuenta.',
  fechaNacimientoObligatoria: 'Por favor, indique su día, mes y año de nacimiento en los selectores.',
  passwordsNoCoinciden: 'Las contraseñas no son iguales. Asegúrese de escribir exactamente lo mismo en las dos casillas para evitar errores.',
  errorRegistro: 'No hemos podido crear su cuenta en este momento. Por favor, revise los datos e inténtelo de nuevo.',

  // --- LOGIN ---
  emailOPasswordIncorrectos: 'El correo o la contraseña no son correctos. Por favor, revíselos y vuelva a intentarlo.',
  errorLogin: 'Ha ocurrido un problema al entrar en su cuenta. Por favor, inténtelo de nuevo en unos instantes.',

  // --- PERFIL ---
  errorActualizarPerfil: 'No hemos podido guardar los cambios en su perfil. Por favor, inténtelo de nuevo.',
  exitoActualizarPerfil: '✅ ¡Muy bien! Sus datos se han guardado correctamente.',

  // --- GENERAL ---
  errorServidor: 'Parece que hay un problema de conexión con nuestro servidor. No se preocupe, inténtelo más tarde.'
}

// --- INSTRUCCIONES REFRÁN ---
export const instruccionesRefranFacil = [
  '📖 Verás la primera parte de un refrán popular español. ¡Seguro que lo conoces!',
  '👆 Pulsa la opción que creas que completa el refrán correctamente. Hay tres opciones para elegir.',
  '✅ Si aciertas, ¡genial! Ganas 10 puntos y puedes seguir al siguiente.',
  '❌ Si te equivocas, no te preocupes — te mostraremos cuál era la respuesta correcta.',
  '⏭ Si no recuerdas un refrán, puedes saltarlo sin ninguna penalización. ¡No pasa nada!',
  '🏁 Cuando termines los 10 refranes, verás un resumen con tu puntuación final.'
]

export const instruccionesRefranDificil = [
  '📖 Verás la primera parte de un refrán popular español. ¡A ver si lo recuerdas!',
  '✍️ Escribe tú mismo en el cuadro de texto cómo termina el refrán.',
  '⏱ Tienes 30 segundos para escribir tu respuesta. ¡Tómate tu tiempo pero no te despistes!',
  '✅ Si aciertas, ¡estupendo! Ganas 10 puntos y sigues adelante.',
  '❌ Si se acaba el tiempo o te equivocas, te mostraremos la respuesta correcta.',
  '⏭ Si no recuerdas un refrán, puedes saltarlo cuando quieras sin penalización.',
  '🏁 Al terminar los 10 refranes, verás un resumen con tu puntuación final.'
]

export const instruccionesMemoryFacil = [
  '🃏 Verás 8 cartas boca arriba durante 3 segundos. ¡Memoriza dónde está cada una!',
  '🔄 Después se voltearán y tendrás que encontrar las 4 parejas iguales.',
  '👆 Pulsa una carta para voltearla, luego pulsa otra para intentar emparejarla.',
  '✅ Si aciertas, ganas 10 puntos y las cartas se quedan visibles.',
  '❌ Si fallas, pierdes 3 puntos y las cartas se vuelven a voltear.',
  '🏁 La partida acaba cuando encuentras todas las parejas.'
]

export const instruccionesMemoryDificil = [
  '🃏 Verás 16 cartas boca arriba durante 3 segundos. ¡Memoriza dónde está cada una!',
  '🔄 Después se voltearán y tendrás que encontrar las 8 parejas iguales.',
  '👆 Pulsa una carta para voltearla, luego pulsa otra para intentar emparejarla.',
  '✅ Si aciertas, ganas 10 puntos y las cartas se quedan visibles.',
  '❌ Si fallas, pierdes 3 puntos y las cartas se vuelven a voltear.',
  '⏱ Tienes 60 segundos para encontrar todas las parejas. ¡Concentración!'
]

export const instruccionesIntrusoFacil = [
  '🖼️ Verás 4 imágenes en pantalla. Tres pertenecen a la misma categoría (por ejemplo, animales) y una no pertenece (el "intruso").',
  '🔍 Tu tarea es encontrar cuál es el intruso, el que no encaja con los demás.',
  '👆 Pulsa la imagen que crees que es el intruso para responder.',
  '✅ Si aciertas, ganas 10 puntos.',
  '💡 Después de cada respuesta, te explicaremos por qué ese era el intruso.',
  '🏁 La partida acaba después de 3 rondas.'
]

export const instruccionesIntrusoDificil = [
  '🖼️ Verás 4 imágenes en pantalla. Tres pertenecen a la misma categoría y una no pertenece (el "intruso").',
  '🤔 En este nivel las categorías son más sutiles, así que tendrás que pensar bien.',
  '⏱ Tienes 30 segundos para responder cada ronda. ¡No te despistes!',
  '👆 Pulsa la imagen que crees que es el intruso para responder.',
  '✅ Si aciertas, ganas 10 puntos.',
  '💡 Después de cada respuesta, te explicaremos por qué ese era el intruso.',
  '🏁 La partida acaba después de 3 rondas.'
]

export const mensajesTendencia = {
  // Títulos según el caso
  titulos: {
    cargando: 'Calculando tu tendencia...',
    sin_datos: '¡Aún no has empezado!',
    pocas_partidas: 'Estás dando tus primeros pasos 🎯',
    mejora: (cambio) => `¡Has mejorado un ${cambio.toFixed(1)}%!`,
    bajada: (cambio) => {
      const abs = Math.abs(cambio)
      if (abs >= 80) return 'Este juego te está costando más estos días'
      if (abs >= 50) return `Has bajado bastante (${abs.toFixed(1)}%)`
      return `Has bajado un ${abs.toFixed(1)}%`
    },
    estable: 'Te mantienes estable'
  },

  subtitulos: {
    sin_datos: 'Cuando juegues tu primera partida, aquí aparecerá tu progreso.',
    pocas_partidas: (partidas) =>
      `Llevas ${partidas} partida${partidas === 1 ? '' : 's'}. Necesitamos al menos 6 para empezar a ver tu evolución.`,
    ok: 'Estamos comparando tus 5 últimas partidas con todas las anteriores.'
  },

  // Consejos: recomendación práctica
  consejos: {
    sin_datos: 'Empieza por una partida en nivel Normal. ¡Lo importante es disfrutar mientras juegas!',
    pocas_partidas: 'Sigue jugando con tranquilidad. Cuantas más partidas tengamos, mejor podremos acompañarte.',
    mejora: '¡Sigue así! Si las partidas te resultan fáciles, puedes probar el nivel Avanzado para mantener el reto.',
    bajada: 'No te preocupes, las bajadas son normales y forman parte del aprendizaje. Prueba a jugar cuando estés descansado/a, sin prisa, y si lo necesitas vuelve al nivel Normal.',
    estable: 'Mantenerse estable también es un logro. Si te apetece avanzar, prueba a subir la dificultad poco a poco.'
  }
}

export const mensajesStats = {
  total_partidas: 'Cuántas veces has jugado a este juego en total.',
  mejor_puntuacion: 'La puntuación más alta que has conseguido. ¡Tu marca personal!',
  puntuacion_media: 'El promedio de todas tus partidas. Refleja tu nivel habitual.',
  ultima_partida: 'El día que jugaste por última vez a este juego.'
}

// Mensajes específicos del gráfico de evolución
export const mensajesGrafico = {
  titulo: 'Evolución de tus puntuaciones',
  descripcion: 'Cada punto representa una partida. La línea muestra cómo van cambiando tus resultados con el tiempo.',
  // Caso: solo hay 1 partida, no hay línea que dibujar
  unaSolaPartida: 'Solo tienes una partida registrada. Juega al menos una más para ver cómo evoluciona tu rendimiento.'
}

// Mensajes específicos del comparativo entre juegos
export const mensajesComparar = {
  titulo: 'Comparar mis juegos',
  subtitulo: 'Aquí puedes ver cómo te va en cada uno de los tres juegos.',
  etiquetas: {
    mejor: 'Donde más destacas',
    estable: 'Donde te mantienes',
    peor: 'Donde puedes mejorar',
    sin_datos: 'Aún sin datos suficientes'
  },
  consejos: {
    mejor: '¡Sigue jugando aquí, lo estás haciendo genial!',
    estable: 'Mantenerte estable también es un logro. Si quieres avanzar, prueba la dificultad Avanzada.',
    peor: 'Tranquilo/a, las bajadas son normales. Prueba a jugar más relajado/a o vuelve al nivel Normal.',
    sin_datos: 'Juega unas cuantas partidas más y aquí podrás ver tu evolución.'
  }
}

// --- ELEMENTOS TABLERO ---
const elementoSalir = { icono: '✕', nombre: 'Salir', descripcion: 'Abandona la partida y vuelve al menú principal.' }
const elementoAyuda = { icono: '❓', nombre: 'Ayuda', descripcion: 'Vuelve a ver estas instrucciones en cualquier momento.' }
const elementoTiempo = { icono: '⏱', nombre: 'Tiempo', descripcion: 'Los segundos que te quedan para responder.' }

export const elementosTableroRefran = (dificultad) => [
  { icono: '📖', nombre: 'Refrán', descripcion: 'Indica en qué refrán vas de los 10 en total.' },
  { icono: '⭐', nombre: 'Puntos', descripcion: 'Los puntos que llevas acumulados. Ganas 10 por cada acierto.' },
  { icono: '✅', nombre: 'Acertados', descripcion: 'Cuántos refranes has completado correctamente.' },
  ...(dificultad === 'dificil' ? [elementoTiempo] : []),
  elementoSalir,
  elementoAyuda
]

export const elementosTableroMemory = (dificultad) => [
  { icono: '✅', nombre: 'Aciertos', descripcion: 'Cuántas parejas has encontrado.' },
  { icono: '⭐', nombre: 'Puntos', descripcion: 'Los puntos que llevas. Ganas 10 por cada pareja, pierdes 3 por fallo.' },
  { icono: '❌', nombre: 'Fallos', descripcion: 'Veces que has volteado dos cartas que no formaban pareja.' },
  ...(dificultad === 'dificil' ? [elementoTiempo] : []),
  elementoSalir,
  elementoAyuda
]

export const elementosTableroIntruso = (dificultad) => [
  { icono: '🖼️', nombre: 'Ronda', descripcion: 'Indica en qué ronda vas del total.' },
  { icono: '⭐', nombre: 'Puntos', descripcion: 'Los puntos que llevas acumulados. Ganas 10 por cada acierto.' },
  { icono: '✅', nombre: 'Aciertos', descripcion: 'Cuántos intrusos has encontrado correctamente.' },
  ...(dificultad === 'dificil' ? [elementoTiempo] : []),
  elementoSalir,
  elementoAyuda
]

export const PUNTOS_ACIERTO = 10
export const UMBRAL_TIEMPO_URGENTE = 10  // Segundos a partir de los cuales el timer se muestra en rojo
export const PUNTOS_PENALIZACION = 3     // Solo Memory
