export const seed = async knex => {
  // Delete existing entries
  await knex('specialties').del();

  // Insert specialty data
  await knex('specialties').insert([
    {
      id: 1,
      name: 'Personal Training',
      slug: 'personal-training',
      description: 'One-on-one coaching tailored to your fitness goals',
      icon_name: 'dumbbell',
      color: 'blue',
      image_url:
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
      sort_order: 1,
    },
    {
      id: 2,
      name: 'Yoga',
      slug: 'yoga',
      description: 'Mindful movement and flexibility training',
      icon_name: 'yoga',
      color: 'purple',
      image_url:
        'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop',
      sort_order: 2,
    },
    {
      id: 3,
      name: 'Nutrition Coaching',
      slug: 'nutrition',
      description: 'Expert guidance for healthy eating habits',
      icon_name: 'apple',
      color: 'green',
      image_url:
        'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=300&fit=crop',
      sort_order: 3,
    },
    {
      id: 4,
      name: 'Strength Training',
      slug: 'strength-training',
      description: 'Build muscle and increase your power',
      icon_name: 'muscle',
      color: 'red',
      image_url:
        'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&h=300&fit=crop',
      sort_order: 4,
    },
    {
      id: 5,
      name: 'Pilates',
      slug: 'pilates',
      description: 'Core strength and body alignment',
      icon_name: 'balance',
      color: 'pink',
      image_url:
        'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=300&fit=crop',
      sort_order: 5,
    },
    {
      id: 6,
      name: 'Cardio Training',
      slug: 'cardio',
      description: 'Boost your endurance and heart health',
      icon_name: 'heart',
      color: 'orange',
      image_url:
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
      sort_order: 6,
    },
    {
      id: 7,
      name: 'Weight Loss',
      slug: 'weight-loss',
      description: 'Sustainable weight management programs',
      icon_name: 'scale',
      color: 'teal',
      image_url:
        'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=400&h=300&fit=crop',
      sort_order: 7,
    },
    {
      id: 8,
      name: 'Sports Performance',
      slug: 'sports-performance',
      description: 'Athletic training for competitive edge',
      icon_name: 'trophy',
      color: 'yellow',
      image_url:
        'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=300&fit=crop',
      sort_order: 8,
    },
    {
      id: 9,
      name: 'HIIT',
      slug: 'hiit',
      description: 'High-intensity interval training',
      icon_name: 'lightning',
      color: 'red',
      image_url:
        'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=400&h=300&fit=crop',
      sort_order: 9,
    },
    {
      id: 10,
      name: 'Injury Recovery',
      slug: 'injury-recovery',
      description: 'Rehabilitation and recovery training',
      icon_name: 'bandage',
      color: 'gray',
      image_url:
        'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop',
      sort_order: 10,
    },
  ]);
};
